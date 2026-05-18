const crypto = require('crypto');
const { pool } = require('../config/db');
const { getToken, recordPayment, verifyOnchainPayment, markPaymentConfirmed } = require('./tokenService');
const { accrueRevenueForPoints } = require('./solanaService');

async function listChests() {
    const { rows } = await pool.query(`SELECT * FROM chests ORDER BY price_amount ASC`);
    return rows.map((row) => ({
        ...row,
        drop_table: safeJsonParse(row.drop_table, []),
    }));
}

function safeJsonParse(value, fallback) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function pickWeighted(entries) {
    const totalWeight = entries.reduce((sum, entry) => sum + (Number(entry.weight) || 0), 0);
    if (totalWeight <= 0) return entries[0];

    const roll = crypto.randomInt(0, Math.max(1, Math.floor(totalWeight)));
    let cumulative = 0;
    for (const entry of entries) {
        cumulative += Number(entry.weight) || 0;
        if (roll < cumulative) return entry;
    }
    return entries[entries.length - 1];
}

function rollFromDropTable(dropTable) {
    const entry = pickWeighted(dropTable);
    if (!entry) return { kind: 'points', amount: 0 };

    if (entry.kind === 'points') {
        const min = Number(entry.min) || 0;
        const max = Number(entry.max) || min;
        const amount = max > min ? crypto.randomInt(min, max + 1) : min;
        return { kind: 'points', amount };
    }
    if (entry.kind === 'character') {
        const list = Array.isArray(entry.ids) ? entry.ids : [];
        return { kind: 'character', character_id: list[crypto.randomInt(0, Math.max(1, list.length))] || null };
    }
    if (entry.kind?.startsWith('token_')) {
        const tokenId = entry.kind.split('_')[1];
        const min = Number(entry.min) || 0;
        const max = Number(entry.max) || min;
        const amount = max > min ? crypto.randomInt(min, max + 1) : min;
        return { kind: 'token', token_id: tokenId, amount };
    }
    if (entry.kind?.startsWith('boost_')) {
        const parts = entry.kind.split('_');
        const multiplier = Number(parts[1].replace('x', '')) || 2;
        return { kind: 'boost', multiplier, duration_sec: 3600 };
    }
    if (entry.kind === 'energy_full') {
        return { kind: 'energy_full' };
    }
    return entry;
}

async function openChest({ telegramId, chestId, signature, senderAddress }) {
    const { rows } = await pool.query(`SELECT * FROM chests WHERE id = $1`, [chestId]);
    if (rows.length === 0) {
        const err = new Error('Chest not found');
        err.statusCode = 404;
        throw err;
    }

    const chest = rows[0];
    const dropTable = safeJsonParse(chest.drop_table, []);
    if (dropTable.length === 0) {
        const err = new Error('Chest has no drops configured');
        err.statusCode = 500;
        throw err;
    }

    const token = await getToken(chest.price_token);
    if (!token) {
        const err = new Error('Chest token not configured');
        err.statusCode = 500;
        throw err;
    }

    const verify = await verifyOnchainPayment({
        tokenId: chest.price_token,
        expectedAmount: chest.price_amount,
        signature,
        senderAddress,
    });
    if (!verify.ok) {
        const err = new Error(verify.error || 'Payment verification failed');
        err.statusCode = 400;
        throw err;
    }

    const payment = await recordPayment({
        telegramId,
        purpose: 'chest_open',
        targetId: chestId,
        tokenId: chest.price_token,
        amount: chest.price_amount,
        signature,
        senderAddress,
        status: 'pending',
    });

    const reward = rollFromDropTable(dropTable);
    const now = Date.now();

    await pool.query(
        `INSERT INTO user_chests (telegram_id, chest_id, opened_at, payment_token, payment_amount, payment_signature, reward_json)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [telegramId, chestId, now, chest.price_token, chest.price_amount, signature || null, JSON.stringify(reward)]
    );

    await markPaymentConfirmed(payment.id);

    if (reward.kind === 'points' && reward.amount > 0) {
        await pool.query(`UPDATE users SET points = points + $1, total_points = total_points + $1 WHERE telegram_id = $2`, [reward.amount, telegramId]);
        await accrueRevenueForPoints(telegramId, reward.amount);
    } else if (reward.kind === 'character' && reward.character_id) {
        await pool.query(
            `INSERT INTO user_characters (telegram_id, character_id, acquired_at) VALUES ($1, $2, $3)
             ON CONFLICT (telegram_id, character_id) DO NOTHING`,
            [telegramId, reward.character_id, now]
        );
    } else if (reward.kind === 'boost') {
        const until = now + (reward.duration_sec || 3600) * 1000;
        await pool.query(`UPDATE users SET boost_multiplier = $1, boost_until = $2 WHERE telegram_id = $3`, [reward.multiplier, until, telegramId]);
        reward.boost_until = until;
    } else if (reward.kind === 'energy_full') {
        await pool.query(`UPDATE users SET energy = max_energy WHERE telegram_id = $1`, [telegramId]);
    }

    return { success: true, reward };
}

async function getUserChestHistory(telegramId, { limit = 25 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 25, 100));
    const { rows } = await pool.query(
        `SELECT * FROM user_chests WHERE telegram_id = $1 ORDER BY opened_at DESC LIMIT $2`,
        [telegramId, safeLimit]
    );
    return rows.map((row) => ({
        ...row,
        reward_json: safeJsonParse(row.reward_json, {}),
    }));
}

module.exports = {
    listChests,
    openChest,
    getUserChestHistory,
};
