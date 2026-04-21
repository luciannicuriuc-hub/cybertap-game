const { pool } = require('../config/db');
const { getOrCreateUser, calculateOfflineEarnings } = require('./userService');
const { accrueRevenueForPoints } = require('./solanaService');

async function applyTap({ telegramId, taps, tapValue }) {
    await getOrCreateUser(telegramId, null, 'Player');

    const validTaps = Math.min(parseInt(taps, 10) || 1, 200);
    const validTapValue = Math.min(parseInt(tapValue, 10) || 1, 1000);
    const totalPoints = validTaps * validTapValue;

    await pool.query(`
        UPDATE users SET
            points = points + $1,
            total_points = total_points + $1
        WHERE telegram_id = $2
    `, [totalPoints, telegramId]);

    await accrueRevenueForPoints(telegramId, totalPoints);

    const { rows } = await pool.query(
        'SELECT points, total_points FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    return {
        points: rows[0]?.points || 0,
        total_points: rows[0]?.total_points || 0,
    };
}

async function collectPassiveIncome(telegramId) {
    const user = await getOrCreateUser(telegramId, null, 'Player');
    if (!user) {
        return { collected: 0, points: 0 };
    }

    const earnings = calculateOfflineEarnings(user);

    if (earnings > 0) {
        await pool.query(`
            UPDATE users SET
                points = points + $1,
                total_points = total_points + $1,
                last_collect = $2
            WHERE telegram_id = $3
        `, [earnings, Date.now(), telegramId]);

        await accrueRevenueForPoints(telegramId, earnings);
    }

    const updated = await pool.query(
        'SELECT points FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    return {
        collected: earnings,
        points: updated.rows[0]?.points || 0,
    };
}

async function buyUpgrade(telegramId, upgradeId) {
    await getOrCreateUser(telegramId, null, 'Player');

    const userRes = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    if (userRes.rows.length === 0) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const upgradeRes = await pool.query(
        'SELECT * FROM upgrades WHERE id = $1',
        [upgradeId]
    );

    if (upgradeRes.rows.length === 0) {
        const error = new Error('Upgrade not found');
        error.statusCode = 404;
        throw error;
    }

    const user = userRes.rows[0];
    const upgrade = upgradeRes.rows[0];

    const lvlRes = await pool.query(`
        SELECT level FROM user_upgrades
        WHERE telegram_id = $1 AND upgrade_id = $2
    `, [telegramId, upgradeId]);

    const currentLevel = lvlRes.rows.length > 0 ? lvlRes.rows[0].level : 0;

    if (currentLevel >= upgrade.max_level) {
        const error = new Error('Maximum level reached');
        error.statusCode = 400;
        throw error;
    }

    const cost = Math.floor(
        parseInt(upgrade.base_cost, 10) *
        Math.pow(parseFloat(upgrade.cost_multiplier), currentLevel)
    );

    if (parseInt(user.points, 10) < cost) {
        const error = new Error('Not enough points');
        error.statusCode = 400;
        error.details = {
            required: cost,
            current: user.points,
        };
        throw error;
    }

    await pool.query(`
        UPDATE users SET points = points - $1
        WHERE telegram_id = $2
    `, [cost, telegramId]);

    await pool.query(`
        INSERT INTO user_upgrades (telegram_id, upgrade_id, level)
        VALUES ($1, $2, 1)
        ON CONFLICT (telegram_id, upgrade_id)
        DO UPDATE SET level = user_upgrades.level + 1
    `, [telegramId, upgradeId]);

    const effect = parseInt(upgrade.effect_per_level, 10);
    const effectType = upgrade.effect_type;

    if (effectType === 'tap_value') {
        await pool.query(`
            UPDATE users SET tap_value = tap_value + $1
            WHERE telegram_id = $2
        `, [effect, telegramId]);
    } else if (effectType === 'max_energy') {
        await pool.query(`
            UPDATE users SET
                max_energy = max_energy + $1,
                energy = LEAST(energy + $1, max_energy + $1)
            WHERE telegram_id = $2
        `, [effect, telegramId]);
    } else if (effectType === 'energy_regen') {
        await pool.query(`
            UPDATE users SET energy_regen = energy_regen + $1
            WHERE telegram_id = $2
        `, [effect, telegramId]);
    } else if (effectType === 'critical_chance') {
        await pool.query(`
            UPDATE users SET critical_chance = critical_chance + $1
            WHERE telegram_id = $2
        `, [effect, telegramId]);
    } else if (effectType === 'passive_income') {
        await pool.query(`
            UPDATE users SET points_per_hour = points_per_hour + $1
            WHERE telegram_id = $2
        `, [effect, telegramId]);
    } else if (effectType === 'bonus_percent') {
        await pool.query(`
            UPDATE users SET bonus_percent = bonus_percent + $1
            WHERE telegram_id = $2
        `, [effect, telegramId]);
    }

    const updated = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    return {
        success: true,
        new_level: currentLevel + 1,
        cost,
        points: updated.rows[0]?.points || 0,
        points_per_hour: updated.rows[0]?.points_per_hour || 0,
        tap_value: updated.rows[0]?.tap_value || 1,
    };
}

async function claimDailyReward(telegramId) {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    await getOrCreateUser(telegramId, null, 'Player');

    await pool.query(`
        INSERT INTO daily_rewards (telegram_id, last_claim, streak)
        VALUES ($1, 0, 0)
        ON CONFLICT DO NOTHING
    `, [telegramId]);

    const { rows } = await pool.query(
        'SELECT * FROM daily_rewards WHERE telegram_id = $1',
        [telegramId]
    );

    const daily = rows[0];
    const timeSinceClaim = now - parseInt(daily.last_claim, 10);

    if (timeSinceClaim < oneDayMs) {
        const error = new Error('Already claimed');
        error.statusCode = 400;
        error.details = {
            time_left: oneDayMs - timeSinceClaim,
        };
        throw error;
    }

    const twoDaysMs = 2 * oneDayMs;
    const newStreak = timeSinceClaim > twoDaysMs
        ? 1
        : parseInt(daily.streak, 10) + 1;

    let reward = 100 * newStreak;
    if (newStreak === 7) reward = 10000;
    if (newStreak === 14) reward = 25000;
    if (newStreak === 21) reward = 50000;
    if (newStreak === 30) reward = 100000;

    await pool.query(`
        UPDATE daily_rewards
        SET last_claim = $1, streak = $2
        WHERE telegram_id = $3
    `, [now, newStreak, telegramId]);

    await pool.query(`
        UPDATE users SET
            points = points + $1,
            total_points = total_points + $1,
            streak = $2,
            last_login = CURRENT_DATE
        WHERE telegram_id = $3
    `, [reward, newStreak, telegramId]);

    await accrueRevenueForPoints(telegramId, reward);

    const updated = await pool.query(
        'SELECT points FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    return {
        reward,
        streak: newStreak,
        points: updated.rows[0]?.points || 0,
    };
}

async function spinWheel({ telegramId, reward, points, special }) {
    await getOrCreateUser(telegramId, null, 'Player');

    const today = new Date().toISOString().split('T')[0];

    const { rows } = await pool.query(`
        SELECT id FROM wheel_spins
        WHERE telegram_id = $1 AND spin_date = $2
    `, [telegramId, today]);

    if (rows.length > 0) {
        const error = new Error('Already spun today');
        error.statusCode = 400;
        throw error;
    }

    await pool.query(`
        INSERT INTO wheel_spins
        (telegram_id, spin_date, reward, points_received, special_received)
        VALUES ($1, $2, $3, $4, $5)
    `, [telegramId, today, reward, points || 0, special]);

    if (points && points > 0) {
        await pool.query(`
            UPDATE users SET
                points = points + $1,
                total_points = total_points + $1
            WHERE telegram_id = $2
        `, [points, telegramId]);

        await accrueRevenueForPoints(telegramId, points);
    }

    if (special === 'energy_full') {
        await pool.query(`
            UPDATE users SET energy = max_energy
            WHERE telegram_id = $1
        `, [telegramId]);
    }

    const updated = await pool.query(
        'SELECT points FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    return {
        success: true,
        points: updated.rows[0]?.points || 0,
    };
}

module.exports = {
    applyTap,
    collectPassiveIncome,
    buyUpgrade,
    claimDailyReward,
    spinWheel,
};
