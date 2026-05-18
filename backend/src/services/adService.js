const { pool } = require('../config/db');
const { accrueRevenueForPoints } = require('./solanaService');

const MAX_ADS_PER_DAY = Number(process.env.MAX_ADS_PER_DAY || 20);
const AD_COOLDOWN_SECONDS = Number(process.env.AD_COOLDOWN_SECONDS || 30);

const REWARDS = {
    points_small: { kind: 'points', amount: 250, label: '+250 points' },
    points_medium: { kind: 'points', amount: 1000, label: '+1000 points' },
    energy_refill: { kind: 'energy', amount: 0, label: 'Full energy refill' },
    boost_2x_5m: { kind: 'boost', multiplier: 2, durationSec: 5 * 60, label: '2x boost · 5min' },
    extra_spin: { kind: 'extra_wheel_spin', label: 'Extra wheel spin' },
};

async function getAdConfig(telegramId) {
    const today = new Date().toISOString().slice(0, 10);
    await pool.query(`UPDATE users SET ads_watched_today = 0, ads_date = $1 WHERE telegram_id = $2 AND (ads_date IS NULL OR ads_date <> $1)`, [today, telegramId]);

    const { rows } = await pool.query(`SELECT ads_watched_today, ads_last_watched_at FROM users WHERE telegram_id = $1`, [telegramId]);
    const watched = Number(rows[0]?.ads_watched_today || 0);
    const lastAt = Number(rows[0]?.ads_last_watched_at || 0);
    const now = Date.now();

    return {
        ads_watched_today: watched,
        ads_max_per_day: MAX_ADS_PER_DAY,
        cooldown_seconds: AD_COOLDOWN_SECONDS,
        next_available_at: lastAt + AD_COOLDOWN_SECONDS * 1000,
        can_watch_now: watched < MAX_ADS_PER_DAY && now >= lastAt + AD_COOLDOWN_SECONDS * 1000,
        available_rewards: Object.entries(REWARDS).map(([id, value]) => ({ id, ...value })),
    };
}

/**
 * Reward a user for watching an ad.
 *
 * TODO[ads]: Integrate a real rewarded-video provider (Adsgram, Onclicka,
 * Telega.io rewarded). Provider sends a server-to-server callback with a
 * signed token. Verify the signature here before crediting the reward.
 */
async function rewardForAdView({ telegramId, placement = 'home', rewardId = 'points_small', providerRef = null, provider = 'mock' }) {
    const reward = REWARDS[rewardId];
    if (!reward) {
        const err = new Error('Unknown ad reward');
        err.statusCode = 400;
        throw err;
    }

    const config = await getAdConfig(telegramId);
    if (!config.can_watch_now) {
        const err = new Error('Ad not available yet');
        err.statusCode = 429;
        err.details = { next_available_at: config.next_available_at };
        throw err;
    }

    const today = new Date().toISOString().slice(0, 10);
    const now = Date.now();

    await pool.query(
        `INSERT INTO ad_views (telegram_id, placement, reward_kind, reward_amount, provider, provider_ref, view_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [telegramId, placement, reward.kind, reward.amount || 0, provider, providerRef, today, now]
    );

    await pool.query(
        `UPDATE users SET ads_watched_today = ads_watched_today + 1, ads_last_watched_at = $1, ads_date = $2 WHERE telegram_id = $3`,
        [now, today, telegramId]
    );

    let payload = { reward_kind: reward.kind, label: reward.label };

    if (reward.kind === 'points') {
        await pool.query(`UPDATE users SET points = points + $1, total_points = total_points + $1 WHERE telegram_id = $2`, [reward.amount, telegramId]);
        await accrueRevenueForPoints(telegramId, reward.amount);
        payload.points_added = reward.amount;
    } else if (reward.kind === 'energy') {
        await pool.query(`UPDATE users SET energy = max_energy WHERE telegram_id = $1`, [telegramId]);
        payload.energy_refilled = true;
    } else if (reward.kind === 'boost') {
        const until = now + reward.durationSec * 1000;
        await pool.query(`UPDATE users SET boost_multiplier = $1, boost_until = $2 WHERE telegram_id = $3`, [reward.multiplier, until, telegramId]);
        payload.boost_multiplier = reward.multiplier;
        payload.boost_until = until;
    } else if (reward.kind === 'extra_wheel_spin') {
        const today = new Date().toISOString().slice(0, 10);
        await pool.query(`DELETE FROM wheel_spins WHERE telegram_id = $1 AND spin_date = $2`, [telegramId, today]);
        payload.extra_spin_granted = true;
    }

    const userRes = await pool.query(`SELECT points, energy, max_energy FROM users WHERE telegram_id = $1`, [telegramId]);
    payload.points = Number(userRes.rows[0]?.points || 0);
    payload.energy = Number(userRes.rows[0]?.energy || 0);
    payload.max_energy = Number(userRes.rows[0]?.max_energy || 0);

    return payload;
}

module.exports = {
    getAdConfig,
    rewardForAdView,
};
