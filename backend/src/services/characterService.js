const { pool } = require('../config/db');

async function listCharacters() {
    const { rows } = await pool.query(`SELECT * FROM characters ORDER BY rarity, name`);
    return rows;
}

async function listUserCharacters(telegramId) {
    const { rows } = await pool.query(
        `SELECT c.*, uc.acquired_at, u.active_character_id = c.id AS is_active
         FROM characters c
         LEFT JOIN user_characters uc ON uc.character_id = c.id AND uc.telegram_id = $1
         LEFT JOIN users u ON u.telegram_id = $1
         WHERE c.id = 'rookie' OR uc.character_id IS NOT NULL
         ORDER BY c.rarity, c.name`,
        [telegramId]
    );
    return rows;
}

async function selectCharacter(telegramId, characterId) {
    if (characterId === 'rookie') {
        await pool.query(`UPDATE users SET active_character_id = $1 WHERE telegram_id = $2`, [characterId, telegramId]);
        return { success: true, active_character_id: characterId };
    }

    const owned = await pool.query(`SELECT 1 FROM user_characters WHERE telegram_id = $1 AND character_id = $2`, [telegramId, characterId]);
    if (owned.rows.length === 0) {
        const err = new Error('You do not own this character');
        err.statusCode = 400;
        throw err;
    }

    await pool.query(`UPDATE users SET active_character_id = $1 WHERE telegram_id = $2`, [characterId, telegramId]);
    return { success: true, active_character_id: characterId };
}

async function getActiveLeagueGroup(telegramId) {
    const { rows } = await pool.query(
        `SELECT c.league_group FROM users u LEFT JOIN characters c ON c.id = u.active_character_id WHERE u.telegram_id = $1`,
        [telegramId]
    );
    return rows[0]?.league_group || 'rookie';
}

module.exports = {
    listCharacters,
    listUserCharacters,
    selectCharacter,
    getActiveLeagueGroup,
};
