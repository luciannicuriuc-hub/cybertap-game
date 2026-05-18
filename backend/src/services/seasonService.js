const { pool } = require('../config/db');

async function getActiveSeason() {
    const { rows } = await pool.query(
        `SELECT * FROM seasons WHERE status = 'active' AND ends_at > $1 ORDER BY ends_at ASC LIMIT 1`,
        [Date.now()]
    );
    return rows[0] || null;
}

async function incrementSeasonScore(telegramId, leagueGroup, points) {
    const season = await getActiveSeason();
    if (!season) return null;

    const safePoints = Math.max(0, Math.floor(Number(points) || 0));
    if (safePoints === 0) return season;

    await pool.query(
        `INSERT INTO season_scores (season_id, telegram_id, league_group, points, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (season_id, telegram_id, league_group)
         DO UPDATE SET points = season_scores.points + $4, updated_at = $5`,
        [season.id, telegramId, leagueGroup || 'global', safePoints, Date.now()]
    );

    return season;
}

async function getSeasonLeaderboard({ leagueGroup = 'global', limit = 100 } = {}) {
    const season = await getActiveSeason();
    if (!season) return { season: null, rows: [] };

    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 250));
    const { rows } = await pool.query(
        `SELECT ss.telegram_id, ss.points, u.first_name, u.username, u.active_character_id
         FROM season_scores ss
         JOIN users u ON u.telegram_id = ss.telegram_id
         WHERE ss.season_id = $1 AND ss.league_group = $2
         ORDER BY ss.points DESC
         LIMIT $3`,
        [season.id, leagueGroup, safeLimit]
    );

    return { season, rows };
}

async function getSeasonPrizes() {
    const season = await getActiveSeason();
    if (!season) return { season: null, prizes: [] };

    const { rows } = await pool.query(
        `SELECT * FROM leaderboard_prizes WHERE season_id = $1 ORDER BY rank_min ASC`,
        [season.id]
    );

    return { season, prizes: rows };
}

async function getUserSeasonRank(telegramId, leagueGroup = 'global') {
    const season = await getActiveSeason();
    if (!season) return null;

    const { rows } = await pool.query(
        `SELECT COUNT(*) + 1 AS rank
         FROM season_scores
         WHERE season_id = $1 AND league_group = $2
           AND points > COALESCE((SELECT points FROM season_scores WHERE season_id = $1 AND league_group = $2 AND telegram_id = $3), 0)`,
        [season.id, leagueGroup, telegramId]
    );

    return Number(rows[0]?.rank) || null;
}

module.exports = {
    getActiveSeason,
    incrementSeasonScore,
    getSeasonLeaderboard,
    getSeasonPrizes,
    getUserSeasonRank,
};
