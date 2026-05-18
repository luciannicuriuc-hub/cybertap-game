const { pool } = require('../config/db');
const { getToken, recordPayment, verifyOnchainPayment, markPaymentConfirmed } = require('./tokenService');

async function listTournaments() {
    const now = Date.now();
    await pool.query(`UPDATE tournaments SET status = 'active' WHERE status = 'upcoming' AND starts_at <= $1 AND ends_at > $1`, [now]);
    await pool.query(`UPDATE tournaments SET status = 'finished' WHERE status IN ('active', 'upcoming') AND ends_at <= $1`, [now]);

    const { rows } = await pool.query(`SELECT * FROM tournaments ORDER BY starts_at DESC LIMIT 50`);
    return rows;
}

async function getTournament(tournamentId) {
    const { rows } = await pool.query(`SELECT * FROM tournaments WHERE id = $1`, [tournamentId]);
    return rows[0] || null;
}

async function getEntries(tournamentId, { limit = 100 } = {}) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 250));
    const { rows } = await pool.query(
        `SELECT te.telegram_id, te.score, te.joined_at, u.first_name, u.username, u.active_character_id
         FROM tournament_entries te
         JOIN users u ON u.telegram_id = te.telegram_id
         WHERE te.tournament_id = $1
         ORDER BY te.score DESC, te.joined_at ASC
         LIMIT $2`,
        [tournamentId, safeLimit]
    );
    return rows;
}

async function joinTournament({ telegramId, tournamentId, signature, senderAddress }) {
    const tournament = await getTournament(tournamentId);
    if (!tournament) {
        const err = new Error('Tournament not found');
        err.statusCode = 404;
        throw err;
    }

    const now = Date.now();
    if (now < Number(tournament.starts_at) || now >= Number(tournament.ends_at)) {
        const err = new Error('Tournament is not currently open');
        err.statusCode = 400;
        throw err;
    }

    const existing = await pool.query(`SELECT 1 FROM tournament_entries WHERE tournament_id = $1 AND telegram_id = $2`, [tournamentId, telegramId]);
    if (existing.rows.length > 0) {
        return { success: true, alreadyJoined: true };
    }

    // Entry fee handling
    const entryPoints = Number(tournament.entry_points) || 0;
    const entryAmount = Number(tournament.entry_amount) || 0;
    const entryToken = tournament.entry_token;

    if (entryPoints > 0) {
        const userRes = await pool.query(`SELECT points FROM users WHERE telegram_id = $1`, [telegramId]);
        const balance = Number(userRes.rows[0]?.points || 0);
        if (balance < entryPoints) {
            const err = new Error('Not enough points to join');
            err.statusCode = 400;
            err.details = { required: entryPoints, current: balance };
            throw err;
        }
        await pool.query(`UPDATE users SET points = points - $1 WHERE telegram_id = $2`, [entryPoints, telegramId]);
    }

    if (entryToken && entryAmount > 0) {
        const verify = await verifyOnchainPayment({ tokenId: entryToken, expectedAmount: entryAmount, signature, senderAddress });
        if (!verify.ok) {
            const err = new Error(verify.error || 'Payment verification failed');
            err.statusCode = 400;
            throw err;
        }
        const payment = await recordPayment({
            telegramId,
            purpose: 'tournament_entry',
            targetId: tournamentId,
            tokenId: entryToken,
            amount: entryAmount,
            signature,
            senderAddress,
            status: 'pending',
        });
        await markPaymentConfirmed(payment.id);
    }

    await pool.query(
        `INSERT INTO tournament_entries (tournament_id, telegram_id, score, joined_at, paid_token, paid_amount, paid_signature, paid_points)
         VALUES ($1, $2, 0, $3, $4, $5, $6, $7)`,
        [tournamentId, telegramId, now, entryToken, entryAmount, signature || null, entryPoints]
    );

    return { success: true, alreadyJoined: false };
}

async function incrementTournamentScores(telegramId, taps) {
    if (!taps || taps <= 0) return;
    const now = Date.now();
    await pool.query(
        `UPDATE tournament_entries te
         SET score = score + $1
         FROM tournaments t
         WHERE te.tournament_id = t.id
           AND te.telegram_id = $2
           AND t.status = 'active'
           AND t.metric = 'taps'
           AND t.starts_at <= $3 AND t.ends_at > $3`,
        [taps, telegramId, now]
    );
}

async function getUserActiveTournaments(telegramId) {
    const { rows } = await pool.query(
        `SELECT t.*, te.score, te.joined_at
         FROM tournaments t
         JOIN tournament_entries te ON te.tournament_id = t.id
         WHERE te.telegram_id = $1 AND t.status IN ('active', 'upcoming')
         ORDER BY t.starts_at DESC`,
        [telegramId]
    );
    return rows;
}

module.exports = {
    listTournaments,
    getTournament,
    getEntries,
    joinTournament,
    incrementTournamentScores,
    getUserActiveTournaments,
};
