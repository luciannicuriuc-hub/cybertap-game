const { pool } = require('../config/db');
const { accrueRevenueForPoints } = require('./solanaService');

const AUTOCLICKER_TAPS_PER_LEVEL = Number(process.env.AUTOCLICKER_TAPS_PER_SEC_PER_LEVEL || 1);
const AUTOCLICKER_MAX_CATCHUP_HOURS = Number(process.env.AUTOCLICKER_MAX_CATCHUP_HOURS || 4);
const AUTOCLICKER_BOOST_TOKEN = process.env.AUTOCLICKER_BOOST_TOKEN || 'sol';
const AUTOCLICKER_BOOST_AMOUNT = Number(process.env.AUTOCLICKER_BOOST_AMOUNT || 10000000);
const AUTOCLICKER_BOOST_DURATION_SEC = Number(process.env.AUTOCLICKER_BOOST_DURATION_SEC || 4 * 60 * 60);

async function getStatus(telegramId) {
    const { rows } = await pool.query(
        `SELECT auto_clicker_level, auto_clicker_until, tap_value FROM users WHERE telegram_id = $1`,
        [telegramId]
    );
    const user = rows[0] || { auto_clicker_level: 0, auto_clicker_until: 0, tap_value: 1 };
    return {
        level: Number(user.auto_clicker_level || 0),
        active_until: Number(user.auto_clicker_until || 0),
        active: Number(user.auto_clicker_until || 0) > Date.now(),
        taps_per_sec: Number(user.auto_clicker_level || 0) * AUTOCLICKER_TAPS_PER_LEVEL,
        tap_value: Number(user.tap_value || 1),
        boost_token: AUTOCLICKER_BOOST_TOKEN,
        boost_amount: AUTOCLICKER_BOOST_AMOUNT,
        boost_duration_sec: AUTOCLICKER_BOOST_DURATION_SEC,
    };
}

/**
 * Apply auto-clicker catch-up income when the user comes back online.
 * Mirrors the offline-passive flow but uses tap_value * taps/sec.
 */
async function collectCatchup(telegramId) {
    const { rows } = await pool.query(
        `SELECT auto_clicker_level, auto_clicker_until, tap_value, last_collect FROM users WHERE telegram_id = $1`,
        [telegramId]
    );
    const user = rows[0];
    if (!user) return { collected: 0 };

    const level = Number(user.auto_clicker_level || 0);
    const activeUntil = Number(user.auto_clicker_until || 0);
    if (level <= 0 || activeUntil <= 0) return { collected: 0 };

    const now = Date.now();
    const lastCollect = Number(user.last_collect || 0);
    const windowEnd = Math.min(now, activeUntil);
    const windowStart = Math.max(lastCollect, now - AUTOCLICKER_MAX_CATCHUP_HOURS * 60 * 60 * 1000);
    const seconds = Math.max(0, Math.floor((windowEnd - windowStart) / 1000));
    const taps = seconds * level * AUTOCLICKER_TAPS_PER_LEVEL;
    const pointsEarned = taps * Number(user.tap_value || 1);

    if (pointsEarned <= 0) return { collected: 0 };

    await pool.query(
        `UPDATE users SET points = points + $1, total_points = total_points + $1, last_collect = $2 WHERE telegram_id = $3`,
        [pointsEarned, now, telegramId]
    );
    await accrueRevenueForPoints(telegramId, pointsEarned);

    return { collected: pointsEarned, taps, seconds };
}

/**
 * Activate (or extend) an auto-clicker boost after paying with a token.
 *
 * TODO[SC]: Verify the on-chain payment via tokenService.verifyOnchainPayment.
 */
async function activate({ telegramId, signature, senderAddress, level = 1 }) {
    const safeLevel = Math.max(1, Math.min(Number(level) || 1, 10));
    const now = Date.now();

    // TODO[SC]: replace stub with verifyOnchainPayment + recordPayment
    const { rows } = await pool.query(
        `SELECT auto_clicker_until FROM users WHERE telegram_id = $1`,
        [telegramId]
    );
    const currentUntil = Number(rows[0]?.auto_clicker_until || 0);
    const extendFrom = Math.max(currentUntil, now);
    const newUntil = extendFrom + AUTOCLICKER_BOOST_DURATION_SEC * 1000;

    await pool.query(
        `UPDATE users SET auto_clicker_level = GREATEST(auto_clicker_level, $1), auto_clicker_until = $2 WHERE telegram_id = $3`,
        [safeLevel, newUntil, telegramId]
    );

    await pool.query(
        `INSERT INTO token_payments (telegram_id, purpose, target_id, token_id, amount, signature, sender_address, status, created_at, confirmed_at)
         VALUES ($1, 'autoclicker_boost', $2, $3, $4, $5, $6, 'confirmed', $7, $7)`,
        [telegramId, String(safeLevel), AUTOCLICKER_BOOST_TOKEN, AUTOCLICKER_BOOST_AMOUNT, signature || null, senderAddress || null, now]
    );

    return {
        success: true,
        level: safeLevel,
        active_until: newUntil,
        taps_per_sec: safeLevel * AUTOCLICKER_TAPS_PER_LEVEL,
    };
}

module.exports = {
    getStatus,
    collectCatchup,
    activate,
};
