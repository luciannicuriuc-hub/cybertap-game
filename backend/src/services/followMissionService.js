const { pool } = require('../config/db');
const { accrueRevenueForPoints } = require('./solanaService');

async function listFollowMissions(telegramId) {
    const { rows } = await pool.query(
        `SELECT fm.*, COALESCE(ufm.status, 'pending') AS user_status, COALESCE(ufm.reward_claimed, FALSE) AS reward_claimed, COALESCE(ufm.verified_at, 0) AS verified_at
         FROM follow_missions fm
         LEFT JOIN user_follow_missions ufm
           ON ufm.mission_id = fm.id AND ufm.telegram_id = $1
         WHERE fm.active = TRUE
         ORDER BY fm.platform`,
        [telegramId]
    );
    return rows;
}

async function markMissionStarted(telegramId, missionId) {
    const missionRes = await pool.query(`SELECT * FROM follow_missions WHERE id = $1 AND active = TRUE`, [missionId]);
    if (missionRes.rows.length === 0) {
        const err = new Error('Mission not found');
        err.statusCode = 404;
        throw err;
    }

    await pool.query(
        `INSERT INTO user_follow_missions (telegram_id, mission_id, status, reward_claimed, verified_at)
         VALUES ($1, $2, 'started', FALSE, 0)
         ON CONFLICT (telegram_id, mission_id) DO UPDATE SET status = CASE
           WHEN user_follow_missions.status = 'pending' THEN 'started'
           ELSE user_follow_missions.status END`,
        [telegramId, missionId]
    );

    return missionRes.rows[0];
}

/**
 * Claim a follow mission reward.
 *
 * TODO[verify]: This currently honors any "started" mission. For real anti-abuse:
 *   - 'telegram' join_channel  => use Telegram Bot API `getChatMember` to confirm.
 *   - 'x' / 'tiktok' / 'youtube' => integrate the platform's API or a third-party
 *     verifier (e.g. Atlassian, Tweetscout) since direct OAuth verification is heavy.
 *   - 'discord' => use Discord bot in the server + OAuth link.
 */
async function claimMission(telegramId, missionId) {
    const missionRes = await pool.query(`SELECT * FROM follow_missions WHERE id = $1 AND active = TRUE`, [missionId]);
    if (missionRes.rows.length === 0) {
        const err = new Error('Mission not found');
        err.statusCode = 404;
        throw err;
    }
    const mission = missionRes.rows[0];

    const claimRes = await pool.query(`SELECT * FROM user_follow_missions WHERE telegram_id = $1 AND mission_id = $2`, [telegramId, missionId]);
    const state = claimRes.rows[0];
    if (state?.reward_claimed) {
        const err = new Error('Reward already claimed');
        err.statusCode = 400;
        throw err;
    }
    if (!state || state.status === 'pending') {
        const err = new Error('You must open the link first');
        err.statusCode = 400;
        throw err;
    }

    const reward = Number(mission.reward) || 0;
    const now = Date.now();
    await pool.query(
        `INSERT INTO user_follow_missions (telegram_id, mission_id, status, reward_claimed, verified_at)
         VALUES ($1, $2, 'verified', TRUE, $3)
         ON CONFLICT (telegram_id, mission_id) DO UPDATE SET status = 'verified', reward_claimed = TRUE, verified_at = $3`,
        [telegramId, missionId, now]
    );

    if (reward > 0) {
        await pool.query(`UPDATE users SET points = points + $1, total_points = total_points + $1 WHERE telegram_id = $2`, [reward, telegramId]);
        await accrueRevenueForPoints(telegramId, reward);
    }

    const userRes = await pool.query(`SELECT points FROM users WHERE telegram_id = $1`, [telegramId]);
    return { success: true, reward, points: Number(userRes.rows[0]?.points || 0) };
}

module.exports = {
    listFollowMissions,
    markMissionStarted,
    claimMission,
};
