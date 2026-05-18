const { pool } = require('../config/db');
const { accrueRevenueForPoints } = require('./solanaService');

async function listReferralTiers() {
    const { rows } = await pool.query(`SELECT * FROM referral_tiers ORDER BY threshold ASC`);
    return rows;
}

async function getReferralProgress(telegramId) {
    const tiers = await listReferralTiers();
    const userRes = await pool.query(
        `SELECT referral_count, highest_referral_tier_claimed FROM users WHERE telegram_id = $1`,
        [telegramId]
    );
    const user = userRes.rows[0] || { referral_count: 0, highest_referral_tier_claimed: 0 };

    const claimsRes = await pool.query(`SELECT tier FROM referral_tier_claims WHERE telegram_id = $1`, [telegramId]);
    const claimed = new Set(claimsRes.rows.map((row) => Number(row.tier)));

    return {
        referral_count: Number(user.referral_count) || 0,
        highest_claimed_tier: Number(user.highest_referral_tier_claimed) || 0,
        tiers: tiers.map((tier) => {
            const threshold = Number(tier.threshold) || 0;
            const reached = (Number(user.referral_count) || 0) >= threshold;
            return {
                ...tier,
                reached,
                claimed: claimed.has(Number(tier.tier)),
            };
        }),
    };
}

async function claimReferralTier(telegramId, tier) {
    const tierNum = Number(tier);
    if (!Number.isFinite(tierNum)) {
        const err = new Error('Invalid tier');
        err.statusCode = 400;
        throw err;
    }

    const tierRes = await pool.query(`SELECT * FROM referral_tiers WHERE tier = $1`, [tierNum]);
    if (tierRes.rows.length === 0) {
        const err = new Error('Tier not found');
        err.statusCode = 404;
        throw err;
    }
    const tierData = tierRes.rows[0];

    const userRes = await pool.query(`SELECT referral_count FROM users WHERE telegram_id = $1`, [telegramId]);
    const count = Number(userRes.rows[0]?.referral_count || 0);
    if (count < Number(tierData.threshold)) {
        const err = new Error('Tier threshold not reached');
        err.statusCode = 400;
        err.details = { required: Number(tierData.threshold), current: count };
        throw err;
    }

    const existing = await pool.query(`SELECT 1 FROM referral_tier_claims WHERE telegram_id = $1 AND tier = $2`, [telegramId, tierNum]);
    if (existing.rows.length > 0) {
        const err = new Error('Tier already claimed');
        err.statusCode = 400;
        throw err;
    }

    const now = Date.now();
    await pool.query(`INSERT INTO referral_tier_claims (telegram_id, tier, claimed_at) VALUES ($1, $2, $3)`, [telegramId, tierNum, now]);

    const rewardPoints = Number(tierData.reward_points) || 0;
    if (rewardPoints > 0) {
        await pool.query(`UPDATE users SET points = points + $1, total_points = total_points + $1 WHERE telegram_id = $2`, [rewardPoints, telegramId]);
        await accrueRevenueForPoints(telegramId, rewardPoints);
    }

    await pool.query(
        `UPDATE users SET highest_referral_tier_claimed = GREATEST(highest_referral_tier_claimed, $1) WHERE telegram_id = $2`,
        [tierNum, telegramId]
    );

    // Token reward: queued as a pending payout. Treasury can settle via /api/wallet/claim or batch script.
    if (tierData.reward_token && Number(tierData.reward_token_amount) > 0) {
        await pool.query(
            `INSERT INTO token_payments (telegram_id, purpose, target_id, token_id, amount, status, created_at)
             VALUES ($1, 'referral_tier', $2, $3, $4, 'queued_payout', $5)`,
            [telegramId, String(tierNum), tierData.reward_token, tierData.reward_token_amount, now]
        );
    }

    // Perk: unlock character or grant boost
    if (tierData.perk?.startsWith('character_')) {
        const characterId = tierData.perk.replace('character_', '');
        await pool.query(
            `INSERT INTO user_characters (telegram_id, character_id, acquired_at) VALUES ($1, $2, $3)
             ON CONFLICT (telegram_id, character_id) DO NOTHING`,
            [telegramId, characterId, now]
        );
    }

    const updated = await pool.query(`SELECT points FROM users WHERE telegram_id = $1`, [telegramId]);

    return {
        success: true,
        tier: tierNum,
        reward_points: rewardPoints,
        reward_token: tierData.reward_token,
        reward_token_amount: Number(tierData.reward_token_amount) || 0,
        perk: tierData.perk,
        points: Number(updated.rows[0]?.points || 0),
    };
}

module.exports = {
    listReferralTiers,
    getReferralProgress,
    claimReferralTier,
};
