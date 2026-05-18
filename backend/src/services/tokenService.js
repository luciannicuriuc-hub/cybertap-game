const { pool } = require('../config/db');

async function listTokens({ onlyEnabled = false } = {}) {
    const { rows } = await pool.query(
        onlyEnabled
            ? `SELECT * FROM tokens WHERE enabled = TRUE ORDER BY id`
            : `SELECT * FROM tokens ORDER BY id`
    );
    return rows;
}

async function getToken(tokenId) {
    if (!tokenId) return null;
    const { rows } = await pool.query(`SELECT * FROM tokens WHERE id = $1`, [tokenId]);
    return rows[0] || null;
}

async function recordPayment({ telegramId, purpose, targetId, tokenId, amount, signature, senderAddress, status = 'pending', errorMessage = null }) {
    const { rows } = await pool.query(
        `INSERT INTO token_payments (telegram_id, purpose, target_id, token_id, amount, signature, sender_address, status, error_message, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [telegramId, purpose, targetId, tokenId, amount, signature, senderAddress, status, errorMessage, Date.now()]
    );
    return rows[0];
}

async function markPaymentConfirmed(paymentId) {
    await pool.query(
        `UPDATE token_payments SET status = 'confirmed', confirmed_at = $1 WHERE id = $2`,
        [Date.now(), paymentId]
    );
}

async function markPaymentFailed(paymentId, errorMessage) {
    await pool.query(
        `UPDATE token_payments SET status = 'failed', error_message = $1 WHERE id = $2`,
        [errorMessage, paymentId]
    );
}

/**
 * Verify an on-chain payment signature for a given token + amount.
 *
 * Current behavior: stub that marks the payment as confirmed once the client
 * submits a signature string. Plug this into the actual Solana RPC verification
 * (Connection.getParsedTransaction + balance delta check) once the treasury
 * wallet + SC are finalized.
 *
 * TODO[SC]: Replace with a real verifier that:
 *   1. fetches the transaction by signature,
 *   2. confirms it is finalized,
 *   3. for SPL: ensures the destination token account belongs to the treasury,
 *   4. checks the transferred amount >= expected amount and the same mint,
 *   5. rejects re-used signatures (already enforced by unique constraints below).
 */
async function verifyOnchainPayment({ tokenId, expectedAmount, signature, senderAddress }) {
    if (!signature || typeof signature !== 'string' || signature.length < 16) {
        return { ok: false, error: 'Missing or invalid payment signature' };
    }

    const token = await getToken(tokenId);
    if (!token) return { ok: false, error: 'Unknown token' };

    // Already-spent signature guard
    const { rows: existing } = await pool.query(
        `SELECT id FROM token_payments WHERE signature = $1 AND status = 'confirmed' LIMIT 1`,
        [signature]
    );
    if (existing.length > 0) {
        return { ok: false, error: 'Signature already used' };
    }

    // TODO[SC]: real on-chain verification goes here.
    return { ok: true, token, expectedAmount, senderAddress };
}

module.exports = {
    listTokens,
    getToken,
    recordPayment,
    markPaymentConfirmed,
    markPaymentFailed,
    verifyOnchainPayment,
};
