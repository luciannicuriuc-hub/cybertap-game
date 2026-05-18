const crypto = require('crypto');
const { pool } = require('../config/db');
const { verifyOnchainPayment, recordPayment, markPaymentConfirmed } = require('./tokenService');

async function listRaffles() {
    const now = Date.now();
    await pool.query(`UPDATE raffles SET status = 'closed' WHERE status = 'open' AND ends_at <= $1`, [now]);

    const { rows } = await pool.query(`SELECT * FROM raffles ORDER BY ends_at DESC LIMIT 20`);
    return rows;
}

async function getRaffle(raffleId) {
    const { rows } = await pool.query(`SELECT * FROM raffles WHERE id = $1`, [raffleId]);
    return rows[0] || null;
}

async function buyTickets({ telegramId, raffleId, ticketCount, payWith = 'points', signature = null, senderAddress = null }) {
    const safeCount = Math.max(1, Math.min(Number(ticketCount) || 1, 1000));
    const raffle = await getRaffle(raffleId);
    if (!raffle) {
        const err = new Error('Raffle not found');
        err.statusCode = 404;
        throw err;
    }

    const now = Date.now();
    if (raffle.status !== 'open' || now < Number(raffle.starts_at) || now >= Number(raffle.ends_at)) {
        const err = new Error('Raffle is not open');
        err.statusCode = 400;
        throw err;
    }

    let paidPoints = 0;
    let paidToken = null;
    let paidAmount = 0;

    if (payWith === 'points') {
        const cost = Number(raffle.ticket_points) * safeCount;
        if (cost <= 0) {
            const err = new Error('Raffle does not accept point payment');
            err.statusCode = 400;
            throw err;
        }
        const userRes = await pool.query(`SELECT points FROM users WHERE telegram_id = $1`, [telegramId]);
        const balance = Number(userRes.rows[0]?.points || 0);
        if (balance < cost) {
            const err = new Error('Not enough points');
            err.statusCode = 400;
            err.details = { required: cost, current: balance };
            throw err;
        }
        await pool.query(`UPDATE users SET points = points - $1 WHERE telegram_id = $2`, [cost, telegramId]);
        paidPoints = cost;
    } else if (payWith === 'token') {
        const expected = Number(raffle.ticket_price) * safeCount;
        if (expected <= 0) {
            const err = new Error('Raffle does not accept token payment');
            err.statusCode = 400;
            throw err;
        }
        const verify = await verifyOnchainPayment({ tokenId: raffle.ticket_token, expectedAmount: expected, signature, senderAddress });
        if (!verify.ok) {
            const err = new Error(verify.error || 'Token payment verification failed');
            err.statusCode = 400;
            throw err;
        }
        const payment = await recordPayment({
            telegramId,
            purpose: 'raffle_ticket',
            targetId: raffleId,
            tokenId: raffle.ticket_token,
            amount: expected,
            signature,
            senderAddress,
            status: 'pending',
        });
        await markPaymentConfirmed(payment.id);
        paidToken = raffle.ticket_token;
        paidAmount = expected;
    } else {
        const err = new Error('Unsupported payWith value');
        err.statusCode = 400;
        throw err;
    }

    await pool.query(
        `INSERT INTO raffle_tickets (raffle_id, telegram_id, ticket_count, paid_token, paid_amount, paid_points, paid_signature, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [raffleId, telegramId, safeCount, paidToken, paidAmount, paidPoints, signature, now]
    );

    await pool.query(`UPDATE users SET raffle_tickets = raffle_tickets + $1 WHERE telegram_id = $2`, [safeCount, telegramId]);

    const totalsRes = await pool.query(
        `SELECT COALESCE(SUM(ticket_count), 0) AS user_tickets FROM raffle_tickets WHERE raffle_id = $1 AND telegram_id = $2`,
        [raffleId, telegramId]
    );

    const poolTotals = await pool.query(
        `SELECT COALESCE(SUM(ticket_count), 0) AS pool_total FROM raffle_tickets WHERE raffle_id = $1`,
        [raffleId]
    );

    return {
        success: true,
        tickets_added: safeCount,
        user_tickets: Number(totalsRes.rows[0]?.user_tickets || 0),
        raffle_total: Number(poolTotals.rows[0]?.pool_total || 0),
    };
}

async function getRaffleSummary(raffleId, telegramId = null) {
    const raffle = await getRaffle(raffleId);
    if (!raffle) return null;

    const totals = await pool.query(
        `SELECT COALESCE(SUM(ticket_count), 0) AS pool_total FROM raffle_tickets WHERE raffle_id = $1`,
        [raffleId]
    );

    let userTickets = 0;
    if (telegramId) {
        const userRes = await pool.query(
            `SELECT COALESCE(SUM(ticket_count), 0) AS user_tickets FROM raffle_tickets WHERE raffle_id = $1 AND telegram_id = $2`,
            [raffleId, telegramId]
        );
        userTickets = Number(userRes.rows[0]?.user_tickets || 0);
    }

    return {
        raffle,
        pool_total: Number(totals.rows[0]?.pool_total || 0),
        user_tickets: userTickets,
    };
}

/**
 * Draw a winner using a verifiable random seed.
 *
 * TODO[SC]: For full fairness, use Switchboard VRF or a commit-reveal scheme.
 * The current implementation uses Node's crypto.randomInt seeded by the
 * raffle ID + ends_at — sufficient for off-chain operation, not provably fair.
 */
async function drawWinner(raffleId) {
    const raffle = await getRaffle(raffleId);
    if (!raffle) {
        const err = new Error('Raffle not found');
        err.statusCode = 404;
        throw err;
    }
    if (raffle.winner_telegram_id) {
        return { success: true, winner_telegram_id: Number(raffle.winner_telegram_id), already_drawn: true };
    }

    const ticketsRes = await pool.query(
        `SELECT telegram_id, ticket_count FROM raffle_tickets WHERE raffle_id = $1`,
        [raffleId]
    );
    const totalTickets = ticketsRes.rows.reduce((sum, row) => sum + Number(row.ticket_count || 0), 0);
    if (totalTickets === 0) {
        const err = new Error('Raffle has no tickets');
        err.statusCode = 400;
        throw err;
    }

    const seed = crypto.createHash('sha256').update(`${raffleId}:${raffle.ends_at}:${Date.now()}`).digest('hex');
    const winningNumber = crypto.randomInt(0, totalTickets);
    let cumulative = 0;
    let winner = null;
    for (const row of ticketsRes.rows) {
        cumulative += Number(row.ticket_count || 0);
        if (winningNumber < cumulative) {
            winner = Number(row.telegram_id);
            break;
        }
    }

    if (!winner) {
        const err = new Error('Unable to pick winner');
        err.statusCode = 500;
        throw err;
    }

    const now = Date.now();
    await pool.query(
        `UPDATE raffles SET status = 'drawn', winner_telegram_id = $1, drawn_at = $2, random_seed = $3 WHERE id = $4`,
        [winner, now, seed, raffleId]
    );

    // Queue prize payout
    if (raffle.prize_token && Number(raffle.prize_amount) > 0) {
        await pool.query(
            `INSERT INTO token_payments (telegram_id, purpose, target_id, token_id, amount, status, created_at)
             VALUES ($1, 'raffle_prize', $2, $3, $4, 'queued_payout', $5)`,
            [winner, raffleId, raffle.prize_token, raffle.prize_amount, now]
        );
    }

    return { success: true, winner_telegram_id: winner, seed };
}

module.exports = {
    listRaffles,
    getRaffle,
    buyTickets,
    getRaffleSummary,
    drawWinner,
};
