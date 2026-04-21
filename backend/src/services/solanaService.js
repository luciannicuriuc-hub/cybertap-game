const crypto = require('crypto');
const bs58 = require('bs58');
const nacl = require('tweetnacl');
const {
    Connection,
    Keypair,
    PublicKey,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
} = require('@solana/web3.js');
const { pool } = require('../config/db');

const REVENUE_LAMPORTS_PER_POINT = Number(process.env.SOLANA_REVENUE_LAMPORTS_PER_POINT || 10);
const MIN_CLAIM_LAMPORTS = Number(process.env.SOLANA_MIN_CLAIM_LAMPORTS || 10);
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

function normalizeSignature(signature) {
    if (Array.isArray(signature)) return Uint8Array.from(signature);
    if (typeof signature === 'string') return Uint8Array.from(bs58.decode(signature));
    if (signature instanceof Uint8Array) return signature;
    return null;
}

function stripWrappedQuotes(value) {
    const trimmed = String(value || '').trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        return trimmed.slice(1, -1).trim();
    }

    return trimmed;
}

function isValidSecretKeyValue(secretKeyValue) {
    if (!secretKeyValue) return false;

    try {
        normalizeSecretKey(secretKeyValue);
        return true;
    } catch (error) {
        return false;
    }
}

function normalizeSecretKey(secretKeyValue) {
    if (!secretKeyValue) return null;

    try {
        const normalizedValue = stripWrappedQuotes(secretKeyValue);

        if (normalizedValue.startsWith('{')) {
            const parsed = JSON.parse(normalizedValue);
            const candidate = Array.isArray(parsed)
                ? parsed
                : Array.isArray(parsed?.secretKey)
                    ? parsed.secretKey
                    : null;

            if (candidate && candidate.length === 64) {
                return Keypair.fromSecretKey(Uint8Array.from(candidate));
            }
        }

        if (normalizedValue.startsWith('[')) {
            const parsed = JSON.parse(normalizedValue);
            if (!Array.isArray(parsed) || parsed.length !== 64) {
                throw new Error('Secret key array must contain 64 numbers');
            }

            return Keypair.fromSecretKey(Uint8Array.from(parsed));
        }

        const decoded = bs58.decode(normalizedValue);
        if (decoded.length !== 64) {
            throw new Error('Secret key must decode to 64 bytes');
        }

        return Keypair.fromSecretKey(decoded);
    } catch (error) {
        const normalizedValue = stripWrappedQuotes(secretKeyValue);

        if (normalizedValue && /^[1-9A-HJ-NP-Za-km-z]{32,}$/.test(normalizedValue)) {
            let looksLikePublicKey = false;

            try {
                new PublicKey(normalizedValue);
                looksLikePublicKey = true;
            } catch (publicKeyError) {
                // Not a valid public key either, fall through to the generic error.
            }

            if (looksLikePublicKey) {
                throw new Error('SOLANA_TREASURY_SECRET_KEY must be a secret key/private key, not a public wallet address');
            }
        }

        throw new Error('Invalid SOLANA_TREASURY_SECRET_KEY format. Use the wallet secret key export as JSON array or base58 secret key, not the public address.');
    }
}

function getTreasurySecretKeyValue() {
    const candidates = [
        process.env.SOLANA_TREASURY_SECRET_KEY,
        // process.env.SOLANA_PRIVATE_KEY,
        // process.env.PRIVATE_KEY,
        // process.env.private_key,
    ];

    for (const candidate of candidates) {
        if (isValidSecretKeyValue(candidate)) {
            return candidate;
        }
    }

    return candidates.find((candidate) => stripWrappedQuotes(candidate)) || '';
}

function getConnection() {
    return new Connection(RPC_URL, 'confirmed');
}

function buildWalletLinkMessage({ telegramId, nonce, expiresAt }) {
    return [
        'CyberTap wallet link',
        `Telegram ID: ${telegramId}`,
        `Nonce: ${nonce}`,
        `Expires: ${new Date(expiresAt).toISOString()}`,
        'Purpose: Link Telegram account to Solana wallet',
    ].join('\n');
}

async function ensureUserExists(telegramId) {
    await pool.query(
        `
            INSERT INTO users (telegram_id, last_collect, last_login)
            VALUES ($1, 0, CURRENT_DATE)
            ON CONFLICT (telegram_id) DO NOTHING
        `,
        [telegramId]
    );
}

async function accrueRevenueForPoints(telegramId, points) {
    const safePoints = Math.max(0, Math.floor(Number(points) || 0));
    if (safePoints <= 0) return { revenue_earned_lamports: 0 };

    await ensureUserExists(telegramId);
    const earnedLamports = safePoints * REVENUE_LAMPORTS_PER_POINT;

    const { rows } = await pool.query(
        `
            UPDATE users
            SET revenue_earned_lamports = revenue_earned_lamports + $1
            WHERE telegram_id = $2
            RETURNING revenue_earned_lamports, revenue_claimed_lamports, wallet_claim_count, wallet_last_claim_amount_lamports
        `,
        [earnedLamports, telegramId]
    );

    return rows[0] || { revenue_earned_lamports: 0, revenue_claimed_lamports: 0, wallet_claim_count: 0, wallet_last_claim_amount_lamports: 0 };
}

async function createWalletChallenge(telegramId) {
    await ensureUserExists(telegramId);

    const nonce = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000;

    await pool.query(
        `
            UPDATE users
            SET wallet_nonce = $1,
                wallet_nonce_expires_at = $2,
                solana_cluster = COALESCE(solana_cluster, 'devnet')
            WHERE telegram_id = $3
        `,
        [nonce, expiresAt, telegramId]
    );

    return {
        nonce,
        expires_at: expiresAt,
        message: buildWalletLinkMessage({ telegramId, nonce, expiresAt }),
    };
}

async function verifyWalletLink(telegramId, walletAddress, signature) {
    if (!walletAddress) {
        const error = new Error('walletAddress is required');
        error.statusCode = 400;
        throw error;
    }

    const parsedWallet = new PublicKey(walletAddress);
    const signatureBytes = normalizeSignature(signature);

    if (!signatureBytes) {
        const error = new Error('Invalid signature format');
        error.statusCode = 400;
        throw error;
    }

    const { rows } = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    const user = rows[0];
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (!user.wallet_nonce || !user.wallet_nonce_expires_at) {
        const error = new Error('Wallet challenge not found. Request a new challenge.');
        error.statusCode = 400;
        throw error;
    }

    if (Date.now() > Number(user.wallet_nonce_expires_at)) {
        const error = new Error('Wallet challenge expired. Request a new challenge.');
        error.statusCode = 400;
        throw error;
    }

    const message = buildWalletLinkMessage({
        telegramId,
        nonce: user.wallet_nonce,
        expiresAt: Number(user.wallet_nonce_expires_at),
    });

    const verified = nacl.sign.detached.verify(
        new TextEncoder().encode(message),
        signatureBytes,
        parsedWallet.toBytes()
    );

    if (!verified) {
        const error = new Error('Wallet signature verification failed');
        error.statusCode = 400;
        throw error;
    }

    const walletConflict = await pool.query(
        'SELECT telegram_id FROM users WHERE wallet_address = $1 AND telegram_id <> $2',
        [walletAddress, telegramId]
    );

    if (walletConflict.rows.length > 0) {
        const error = new Error('This wallet is already linked to another Telegram account');
        error.statusCode = 409;
        throw error;
    }

    const updated = await pool.query(
        `
            UPDATE users
            SET wallet_address = $1,
                wallet_verified_at = $2,
                wallet_nonce = NULL,
                wallet_nonce_expires_at = NULL,
                solana_cluster = COALESCE(solana_cluster, 'devnet')
            WHERE telegram_id = $3
            RETURNING wallet_address, wallet_verified_at, revenue_earned_lamports, revenue_claimed_lamports, wallet_claim_count, wallet_last_claim_amount_lamports, revenue_last_claim_at, revenue_last_claim_signature
        `,
        [walletAddress, Date.now(), telegramId]
    );

    return {
        success: true,
        wallet_address: updated.rows[0]?.wallet_address || walletAddress,
        wallet_verified_at: updated.rows[0]?.wallet_verified_at || Date.now(),
        revenue_earned_lamports: Number(updated.rows[0]?.revenue_earned_lamports) || 0,
        revenue_claimed_lamports: Number(updated.rows[0]?.revenue_claimed_lamports) || 0,
        wallet_claim_count: Number(updated.rows[0]?.wallet_claim_count) || 0,
        wallet_last_claim_amount_lamports: Number(updated.rows[0]?.wallet_last_claim_amount_lamports) || 0,
        revenue_last_claim_at: Number(updated.rows[0]?.revenue_last_claim_at) || 0,
        revenue_last_claim_signature: updated.rows[0]?.revenue_last_claim_signature || null,
    };
}

async function getWalletStatus(telegramId) {
    await ensureUserExists(telegramId);

    const { rows } = await pool.query(
        `
            SELECT
                telegram_id,
                wallet_address,
                wallet_verified_at,
                wallet_nonce_expires_at,
                revenue_earned_lamports,
                revenue_claimed_lamports,
                wallet_claim_count,
                wallet_last_claim_amount_lamports,
                revenue_last_claim_at,
                revenue_last_claim_signature,
                solana_cluster
            FROM users
            WHERE telegram_id = $1
        `,
        [telegramId]
    );

    const row = rows[0] || {};
    const revenueEarned = Number(row.revenue_earned_lamports) || 0;
    const revenueClaimed = Number(row.revenue_claimed_lamports) || 0;
    const claimableLamports = Math.max(0, revenueEarned - revenueClaimed);

    return {
        telegram_id: telegramId,
        wallet_address: row.wallet_address || null,
        wallet_verified_at: row.wallet_verified_at || null,
        wallet_nonce_expires_at: row.wallet_nonce_expires_at || null,
        revenue_earned_lamports: revenueEarned,
        revenue_claimed_lamports: revenueClaimed,
        wallet_claim_count: Number(row.wallet_claim_count) || 0,
        wallet_last_claim_amount_lamports: Number(row.wallet_last_claim_amount_lamports) || 0,
        revenue_claimable_lamports: claimableLamports,
        revenue_claimable_sol: claimableLamports / LAMPORTS_PER_SOL,
        revenue_lamports_per_point: REVENUE_LAMPORTS_PER_POINT,
        minimum_claim_lamports: MIN_CLAIM_LAMPORTS,
        revenue_last_claim_at: row.revenue_last_claim_at || 0,
        revenue_last_claim_signature: row.revenue_last_claim_signature || null,
        solana_cluster: row.solana_cluster || 'devnet',
    };
}

async function claimRevenue(telegramId) {
    await ensureUserExists(telegramId);

    const { rows } = await pool.query(
        `
            SELECT
                wallet_address,
                revenue_earned_lamports,
                revenue_claimed_lamports
            FROM users
            WHERE telegram_id = $1
        `,
        [telegramId]
    );

    const user = rows[0];
    if (!user?.wallet_address) {
        const error = new Error('Link a Solana wallet first');
        error.statusCode = 400;
        throw error;
    }

    const claimableLamports = Math.max(0, Number(user.revenue_earned_lamports || 0) - Number(user.revenue_claimed_lamports || 0));
    if (claimableLamports < MIN_CLAIM_LAMPORTS) {
        const error = new Error(`Minimum claim is ${MIN_CLAIM_LAMPORTS} lamports`);
        error.statusCode = 400;
        error.details = { claimable_lamports: claimableLamports };
        throw error;
    }

    const treasurySecretKey = getTreasurySecretKeyValue();
    const treasury = normalizeSecretKey(treasurySecretKey);

    if (!treasury) {
        const error = new Error('Solana treasury private key is not configured');
        error.statusCode = 500;
        throw error;
    }

    const connection = getConnection();
    const receiver = new PublicKey(user.wallet_address);
    const transferInstruction = SystemProgram.transfer({
        fromPubkey: treasury.publicKey,
        toPubkey: receiver,
        lamports: claimableLamports,
    });

    const transaction = new Transaction().add(transferInstruction);
    transaction.feePayer = treasury.publicKey;

    const balance = await connection.getBalance(treasury.publicKey, 'confirmed');
    if (balance < claimableLamports) {
        const error = new Error('Treasury wallet does not have enough SOL');
        error.statusCode = 400;
        error.details = { treasury_balance_lamports: balance };
        throw error;
    }

    const signature = await sendAndConfirmTransaction(connection, transaction, [treasury], {
        commitment: 'confirmed',
    });

    const updated = await pool.query(
        `
            UPDATE users
            SET revenue_claimed_lamports = revenue_claimed_lamports + $1,
                wallet_claim_count = wallet_claim_count + 1,
                wallet_last_claim_amount_lamports = $1,
                revenue_last_claim_at = $2,
                revenue_last_claim_signature = $3
            WHERE telegram_id = $4
            RETURNING revenue_earned_lamports, revenue_claimed_lamports, wallet_claim_count, wallet_last_claim_amount_lamports, revenue_last_claim_at, revenue_last_claim_signature
        `,
        [claimableLamports, Date.now(), signature, telegramId]
    );

    const result = updated.rows[0] || {};

    return {
        success: true,
        signature,
        claimed_lamports: claimableLamports,
        claimed_sol: claimableLamports / LAMPORTS_PER_SOL,
        revenue_earned_lamports: Number(result.revenue_earned_lamports) || 0,
        revenue_claimed_lamports: Number(result.revenue_claimed_lamports) || 0,
        wallet_claim_count: Number(result.wallet_claim_count) || 0,
        wallet_last_claim_amount_lamports: Number(result.wallet_last_claim_amount_lamports) || claimableLamports,
        revenue_last_claim_at: Number(result.revenue_last_claim_at) || Date.now(),
        revenue_last_claim_signature: result.revenue_last_claim_signature || signature,
    };
}

module.exports = {
    accrueRevenueForPoints,
    createWalletChallenge,
    verifyWalletLink,
    getWalletStatus,
    claimRevenue,
    buildWalletLinkMessage,
    getTreasurySecretKeyValue,
    REVENUE_LAMPORTS_PER_POINT,
    MIN_CLAIM_LAMPORTS,
};