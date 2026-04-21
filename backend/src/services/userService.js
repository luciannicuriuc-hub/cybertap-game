const { pool } = require('../config/db');

const LEAGUES = [
    { name: 'Bronze', icon: '🥉', min: 0 },
    { name: 'Silver', icon: '🥈', min: 10000 },
    { name: 'Gold', icon: '🥇', min: 50000 },
    { name: 'Diamond', icon: '💎', min: 200000 },
    { name: 'Elite', icon: '👑', min: 1000000 },
    { name: 'Legendary', icon: '🔥', min: 10000000 },
    { name: 'Mythic', icon: '⚡', min: 100000000 },
];

function formatNum(num) {
    num = Math.floor(Number(num) || 0);
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function getUserLeague(totalPoints) {
    let current = LEAGUES[0];

    for (const league of LEAGUES) {
        if (totalPoints >= league.min) current = league;
        else break;
    }

    return current;
}

function calculateOfflineEarnings(user) {
    const now = Date.now();
    const lastCollect = parseInt(user.last_collect) || now;
    const hoursPassed = (now - lastCollect) / (1000 * 60 * 60);
    const maxHours = 8;
    const effectiveHours = Math.min(hoursPassed, maxHours);
    const pointsPerHour = parseInt(user.points_per_hour) || 0;

    return Math.floor(effectiveHours * pointsPerHour);
}

async function findUserByTelegramId(telegramId) {
    const { rows } = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    return rows[0] || null;
}

async function createUser(telegramId, username, firstName, referrerId = null) {
    await pool.query(`
        INSERT INTO users (
            telegram_id, username, first_name,
            referrer_id, last_collect, last_login
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
    `, [telegramId, username, firstName, referrerId, Date.now()]);

    if (referrerId && referrerId !== telegramId) {
        await pool.query(`
            UPDATE users SET
                points = points + 500,
                total_points = total_points + 500,
                referral_count = referral_count + 1
            WHERE telegram_id = $1
        `, [referrerId]);
    }

    return findUserByTelegramId(telegramId);
}

async function getOrCreateUser(telegramId, username, firstName, referrerId = null) {
    const user = await findUserByTelegramId(telegramId);
    if (user) return user;

    return createUser(telegramId, username, firstName, referrerId);
}

async function getUserProfile(telegramId) {
    let user = await findUserByTelegramId(telegramId);

    if (!user) {
        user = await getOrCreateUser(telegramId, null, 'Player');
    }

    const offlineEarnings = calculateOfflineEarnings(user);
    const upgradesRes = await pool.query(`
        SELECT u.id, u.name, u.category, u.icon,
               u.base_cost, u.cost_multiplier, u.max_level,
               u.effect_per_level, u.effect_type, u.description,
               COALESCE(uu.level, 0) as level
        FROM upgrades u
        LEFT JOIN user_upgrades uu
            ON u.id = uu.upgrade_id
            AND uu.telegram_id = $1
        ORDER BY u.category, u.base_cost
    `, [telegramId]);

    return {
        ...user,
        offline_earnings: offlineEarnings,
        upgrades: upgradesRes.rows,
    };
}

async function getUserRank(telegramId) {
    const { rows } = await pool.query(`
        SELECT COUNT(*) + 1 as rank
        FROM users
        WHERE total_points > (
            SELECT total_points FROM users
            WHERE telegram_id = $1
        )
    `, [telegramId]);

    return Number(rows[0]?.rank) || 0;
}

async function getLeaderboard(limit = 100) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 100));
    const { rows } = await pool.query(`
        SELECT
            telegram_id,
            username,
            first_name,
            points,
            total_points,
            points_per_hour,
            referral_count,
            streak
        FROM users
        ORDER BY total_points DESC
        LIMIT $1
    `, [safeLimit]);

    return rows;
}

module.exports = {
    LEAGUES,
    formatNum,
    getUserLeague,
    calculateOfflineEarnings,
    findUserByTelegramId,
    getOrCreateUser,
    createUser,
    getUserProfile,
    getUserRank,
    getLeaderboard,
};
