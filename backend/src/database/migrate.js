const DEFAULT_UPGRADES = [
    { id: 'multi_tap', name: 'Multi-Tap', category: 'tap', icon: '🖱️', baseCost: 500, costMultiplier: 1.5, maxLevel: 50, effectPerLevel: 1, effectType: 'tap_value', description: '+1 point per tap' },
    { id: 'energy_max', name: 'Energy Tank', category: 'tap', icon: '🔋', baseCost: 1000, costMultiplier: 1.4, maxLevel: 30, effectPerLevel: 500, effectType: 'max_energy', description: '+500 max energy' },
    { id: 'energy_regen', name: 'Power Supply', category: 'tap', icon: '⚡', baseCost: 2000, costMultiplier: 1.6, maxLevel: 20, effectPerLevel: 1, effectType: 'energy_regen', description: '+1 energy/sec regen' },
    { id: 'critical_tap', name: 'Critical Strike', category: 'tap', icon: '💥', baseCost: 5000, costMultiplier: 1.8, maxLevel: 15, effectPerLevel: 5, effectType: 'critical_chance', description: '+5% critical hit chance' },
    { id: 'gpu_basic', name: 'Basic GPU', category: 'passive', icon: '🖥️', baseCost: 1000, costMultiplier: 1.3, maxLevel: 100, effectPerLevel: 10, effectType: 'passive_income', description: '+10 points/hour' },
    { id: 'server_rack', name: 'Server Rack', category: 'passive', icon: '🗄️', baseCost: 5000, costMultiplier: 1.35, maxLevel: 50, effectPerLevel: 50, effectType: 'passive_income', description: '+50 points/hour' },
    { id: 'data_center', name: 'Data Center', category: 'passive', icon: '🏢', baseCost: 25000, costMultiplier: 1.4, maxLevel: 30, effectPerLevel: 200, effectType: 'passive_income', description: '+200 points/hour' },
    { id: 'bot_network', name: 'Bot Network', category: 'passive', icon: '🤖', baseCost: 100000, costMultiplier: 1.45, maxLevel: 20, effectPerLevel: 500, effectType: 'passive_income', description: '+500 points/hour' },
    { id: 'ai_system', name: 'AI Supercomputer', category: 'passive', icon: '🧠', baseCost: 500000, costMultiplier: 1.5, maxLevel: 15, effectPerLevel: 2000, effectType: 'passive_income', description: '+2000 points/hour' },
    { id: 'quantum_cpu', name: 'Quantum CPU', category: 'passive', icon: '🧩', baseCost: 2000000, costMultiplier: 1.6, maxLevel: 10, effectPerLevel: 5000, effectType: 'passive_income', description: '+5000 points/hour' },
    { id: 'vpn_premium', name: 'VPN Premium', category: 'special', icon: '🛡️', baseCost: 50000, costMultiplier: 2.0, maxLevel: 5, effectPerLevel: 10, effectType: 'bonus_percent', description: '+10% to all earnings' },
    { id: 'dark_web', name: 'Dark Web Access', category: 'special', icon: '🕸️', baseCost: 100000, costMultiplier: 2.0, maxLevel: 5, effectPerLevel: 15, effectType: 'bonus_percent', description: '+15% passive income' },
    { id: 'ai_assistant', name: 'AI Assistant', category: 'special', icon: '🛰️', baseCost: 200000, costMultiplier: 2.0, maxLevel: 5, effectPerLevel: 1, effectType: 'passive_income', description: 'Auto-tap 1/sec offline' },
    { id: 'auto_clicker', name: 'Auto Clicker', category: 'special', icon: '⚙️', baseCost: 75000, costMultiplier: 1.8, maxLevel: 10, effectPerLevel: 1, effectType: 'auto_clicker', description: '+1 auto tap/sec (online boost)' },
];

const DEFAULT_TOKENS = [
    { id: 'sol', symbol: 'SOL', name: 'Solana', icon: '◎', mint: null, decimals: 9, enabled: true, kind: 'native' },
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin', icon: '💵', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6, enabled: true, kind: 'spl' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether', icon: '💲', mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', decimals: 6, enabled: false, kind: 'spl' },
    { id: 'bonk', symbol: 'BONK', name: 'Bonk', icon: '🐶', mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', decimals: 5, enabled: false, kind: 'spl' },
    { id: 'ctp', symbol: 'CTP', name: 'CyberTap Token', icon: '🪙', mint: null, decimals: 9, enabled: false, kind: 'spl' },
];

const DEFAULT_CHESTS = [
    { id: 'common', name: 'Common Chest', icon: '📦', priceToken: 'sol', priceAmount: '5000000', minPoints: 1000, maxPoints: 10000, dropTable: JSON.stringify([{ kind: 'points', weight: 80, min: 1000, max: 5000 }, { kind: 'energy_full', weight: 15 }, { kind: 'boost_2x_1h', weight: 5 }]) },
    { id: 'rare', name: 'Rare Chest', icon: '🎁', priceToken: 'sol', priceAmount: '25000000', minPoints: 10000, maxPoints: 75000, dropTable: JSON.stringify([{ kind: 'points', weight: 60, min: 10000, max: 50000 }, { kind: 'energy_full', weight: 15 }, { kind: 'boost_2x_1h', weight: 15 }, { kind: 'token_usdc', weight: 10, min: '10000', max: '100000' }]) },
    { id: 'epic', name: 'Epic Chest', icon: '💎', priceToken: 'sol', priceAmount: '100000000', minPoints: 50000, maxPoints: 300000, dropTable: JSON.stringify([{ kind: 'points', weight: 50, min: 50000, max: 250000 }, { kind: 'boost_5x_1h', weight: 20 }, { kind: 'token_usdc', weight: 20, min: '100000', max: '500000' }, { kind: 'character', weight: 10, ids: ['neon_runner', 'glitch_ghost'] }]) },
    { id: 'legendary', name: 'Legendary Chest', icon: '👑', priceToken: 'sol', priceAmount: '500000000', minPoints: 200000, maxPoints: 2000000, dropTable: JSON.stringify([{ kind: 'points', weight: 40, min: 200000, max: 1500000 }, { kind: 'token_usdc', weight: 25, min: '500000', max: '5000000' }, { kind: 'character', weight: 20, ids: ['quantum_admin', 'phantom_op'] }, { kind: 'boost_10x_1h', weight: 15 }]) },
];

const DEFAULT_CHARACTERS = [
    { id: 'rookie', name: 'Rookie Hacker', icon: '🧑‍💻', leagueGroup: 'rookie', tapBonus: 0, passiveBonus: 0, rarity: 'common', description: 'Starter cursor for new operators' },
    { id: 'neon_runner', name: 'Neon Runner', icon: '🏃‍♂️', leagueGroup: 'runner', tapBonus: 5, passiveBonus: 0, rarity: 'rare', description: '+5% tap value, separate league' },
    { id: 'glitch_ghost', name: 'Glitch Ghost', icon: '👻', leagueGroup: 'ghost', tapBonus: 0, passiveBonus: 10, rarity: 'rare', description: '+10% passive income, separate league' },
    { id: 'quantum_admin', name: 'Quantum Admin', icon: '🛸', leagueGroup: 'quantum', tapBonus: 10, passiveBonus: 10, rarity: 'epic', description: '+10% both, premium league' },
    { id: 'phantom_op', name: 'Phantom Op', icon: '🦹', leagueGroup: 'phantom', tapBonus: 15, passiveBonus: 5, rarity: 'epic', description: '+15% tap, +5% passive, premium league' },
];

const DEFAULT_FOLLOW_MISSIONS = [
    { id: 'tg_channel_main', platform: 'telegram', action: 'join_channel', target: '@cybertap_official', reward: 2500, title: 'Join Official Telegram', icon: '✈️', verify: 'manual', active: true },
    { id: 'tg_channel_news', platform: 'telegram', action: 'join_channel', target: '@cybertap_news', reward: 1500, title: 'Join News Channel', icon: '📰', verify: 'manual', active: true },
    { id: 'x_follow', platform: 'x', action: 'follow', target: 'cybertap', reward: 3000, title: 'Follow on X', icon: '𝕏', verify: 'manual', active: true },
    { id: 'x_retweet_pinned', platform: 'x', action: 'retweet', target: 'pinned', reward: 2000, title: 'Retweet pinned post', icon: '🔁', verify: 'manual', active: true },
    { id: 'yt_subscribe', platform: 'youtube', action: 'subscribe', target: '@cybertap', reward: 2500, title: 'Subscribe on YouTube', icon: '▶️', verify: 'manual', active: true },
    { id: 'discord_join', platform: 'discord', action: 'join', target: 'cybertap', reward: 2000, title: 'Join Discord server', icon: '💬', verify: 'manual', active: true },
    { id: 'tiktok_follow', platform: 'tiktok', action: 'follow', target: '@cybertap', reward: 1500, title: 'Follow on TikTok', icon: '🎵', verify: 'manual', active: true },
];

const DEFAULT_REFERRAL_TIERS = [
    { tier: 1, threshold: 1, rewardPoints: 500, rewardToken: null, rewardTokenAmount: '0', perk: null, label: 'First Friend' },
    { tier: 2, threshold: 3, rewardPoints: 2000, rewardToken: null, rewardTokenAmount: '0', perk: 'vpn_premium', label: 'VPN Premium unlocked' },
    { tier: 3, threshold: 5, rewardPoints: 5000, rewardToken: null, rewardTokenAmount: '0', perk: 'recruiter_badge', label: 'Recruiter Badge' },
    { tier: 4, threshold: 10, rewardPoints: 15000, rewardToken: 'sol', rewardTokenAmount: '2000000', perk: 'ai_assistant', label: 'AI Assistant + 0.002 SOL' },
    { tier: 5, threshold: 25, rewardPoints: 50000, rewardToken: 'sol', rewardTokenAmount: '10000000', perk: 'character_neon_runner', label: 'Neon Runner Skin + 0.01 SOL' },
    { tier: 6, threshold: 50, rewardPoints: 150000, rewardToken: 'sol', rewardTokenAmount: '50000000', perk: 'network_master', label: 'Network Master + 0.05 SOL' },
    { tier: 7, threshold: 100, rewardPoints: 500000, rewardToken: 'sol', rewardTokenAmount: '200000000', perk: 'vip_status', label: 'VIP + 0.2 SOL' },
];

function getPointsPerHour(upgrade) {
    return upgrade.effectType === 'passive_income' ? Number(upgrade.effectPerLevel) || 0 : 0;
}

async function migrateDatabase(pool) {
    console.log('🔄 Running database migrations...');

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            telegram_id BIGINT PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            referrer_id BIGINT,
            wallet_address TEXT,
            wallet_verified_at BIGINT,
            wallet_nonce TEXT,
            wallet_nonce_expires_at BIGINT,
            points BIGINT NOT NULL DEFAULT 0,
            total_points BIGINT NOT NULL DEFAULT 0,
            points_per_hour INTEGER NOT NULL DEFAULT 0,
            tap_value INTEGER NOT NULL DEFAULT 1,
            critical_chance INTEGER NOT NULL DEFAULT 0,
            energy INTEGER NOT NULL DEFAULT 1000,
            max_energy INTEGER NOT NULL DEFAULT 1000,
            energy_regen INTEGER NOT NULL DEFAULT 1,
            bonus_percent INTEGER NOT NULL DEFAULT 0,
            referral_count INTEGER NOT NULL DEFAULT 0,
            streak INTEGER NOT NULL DEFAULT 0,
            last_collect BIGINT NOT NULL DEFAULT 0,
            revenue_earned_lamports BIGINT NOT NULL DEFAULT 0,
            revenue_claimed_lamports BIGINT NOT NULL DEFAULT 0,
            wallet_claim_count INTEGER NOT NULL DEFAULT 0,
            wallet_last_claim_amount_lamports BIGINT NOT NULL DEFAULT 0,
            revenue_last_claim_at BIGINT NOT NULL DEFAULT 0,
            revenue_last_claim_signature TEXT,
            solana_cluster TEXT NOT NULL DEFAULT 'devnet',
            last_login DATE,
            created_at BIGINT NOT NULL DEFAULT ((EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT)
        )
    `);

    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id BIGINT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_verified_at BIGINT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_nonce TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_nonce_expires_at BIGINT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS points BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS points_per_hour INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tap_value INTEGER NOT NULL DEFAULT 1`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS critical_chance INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS energy INTEGER NOT NULL DEFAULT 1000`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS max_energy INTEGER NOT NULL DEFAULT 1000`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS energy_regen INTEGER NOT NULL DEFAULT 1`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bonus_percent INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_collect BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS revenue_earned_lamports BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS revenue_claimed_lamports BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_claim_count INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_last_claim_amount_lamports BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS revenue_last_claim_at BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS revenue_last_claim_signature TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS solana_cluster TEXT NOT NULL DEFAULT 'devnet'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login DATE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at BIGINT NOT NULL DEFAULT ((EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT)`);

    // New columns for advanced features
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS active_character_id TEXT NOT NULL DEFAULT 'rookie'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_clicker_level INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS auto_clicker_until BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS boost_multiplier INTEGER NOT NULL DEFAULT 1`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS boost_until BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ads_watched_today INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ads_last_watched_at BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ads_date DATE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS highest_referral_tier_claimed INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS raffle_tickets INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_wallet_address_unique ON users (wallet_address) WHERE wallet_address IS NOT NULL`);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS upgrades (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            points_per_hour INTEGER NOT NULL DEFAULT 0,
            category TEXT NOT NULL,
            icon TEXT NOT NULL,
            base_cost BIGINT NOT NULL DEFAULT 0,
            cost_multiplier NUMERIC NOT NULL DEFAULT 1,
            max_level INTEGER NOT NULL DEFAULT 1,
            effect_per_level INTEGER NOT NULL DEFAULT 0,
            effect_type TEXT NOT NULL DEFAULT 'passive_income',
            description TEXT NOT NULL DEFAULT ''
        )
    `);

    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS category TEXT`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS icon TEXT`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS points_per_hour INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS base_cost BIGINT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS cost_multiplier NUMERIC NOT NULL DEFAULT 1`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS max_level INTEGER NOT NULL DEFAULT 1`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS effect_per_level INTEGER NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS effect_type TEXT NOT NULL DEFAULT 'passive_income'`);
    await pool.query(`ALTER TABLE upgrades ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`);

    const upgradesRes = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'upgrades'
    `);
    const upgradeColumns = new Map(upgradesRes.rows.map((row) => [row.column_name, row.data_type]));

    if (upgradeColumns.has('id') && upgradeColumns.get('id') !== 'text') {
        await pool.query(`ALTER TABLE upgrades DROP CONSTRAINT IF EXISTS upgrades_pkey`);
        await pool.query(`ALTER TABLE upgrades ALTER COLUMN id TYPE TEXT USING id::text`);
        await pool.query(`ALTER TABLE upgrades ADD PRIMARY KEY (id)`);
    }

    await pool.query(`
        ALTER TABLE upgrades
        ALTER COLUMN base_cost TYPE BIGINT
        USING CASE
            WHEN base_cost IS NULL THEN 0
            WHEN base_cost::text ~ '^-?[0-9]+$' THEN base_cost::text::BIGINT
            ELSE 0
        END
    `);
    await pool.query(`
        ALTER TABLE upgrades
        ALTER COLUMN cost_multiplier TYPE NUMERIC
        USING CASE
            WHEN cost_multiplier IS NULL THEN 1
            WHEN cost_multiplier::text ~ '^-?[0-9]+(\\.[0-9]+)?$' THEN cost_multiplier::text::NUMERIC
            ELSE 1
        END
    `);
    await pool.query(`
        ALTER TABLE upgrades
        ALTER COLUMN max_level TYPE INTEGER
        USING CASE
            WHEN max_level IS NULL THEN 1
            WHEN max_level::text ~ '^-?[0-9]+$' THEN max_level::text::INTEGER
            ELSE 1
        END
    `);
    await pool.query(`
        ALTER TABLE upgrades
        ALTER COLUMN effect_per_level TYPE INTEGER
        USING CASE
            WHEN effect_per_level IS NULL THEN 0
            WHEN effect_per_level::text ~ '^-?[0-9]+$' THEN effect_per_level::text::INTEGER
            ELSE 0
        END
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_upgrades (
            telegram_id BIGINT NOT NULL,
            upgrade_id TEXT NOT NULL,
            level INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (telegram_id, upgrade_id)
        )
    `);

    await pool.query(`ALTER TABLE user_upgrades ALTER COLUMN upgrade_id TYPE TEXT USING upgrade_id::text`);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS daily_rewards (
            telegram_id BIGINT PRIMARY KEY,
            last_claim BIGINT NOT NULL DEFAULT 0,
            streak INTEGER NOT NULL DEFAULT 0
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS wheel_spins (
            id BIGSERIAL PRIMARY KEY,
            telegram_id BIGINT NOT NULL,
            spin_date DATE NOT NULL,
            reward TEXT,
            points_received BIGINT NOT NULL DEFAULT 0,
            special_received TEXT,
            UNIQUE (telegram_id, spin_date)
        )
    `);

    // ------- TOKENS (catalog) -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tokens (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            name TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT '🪙',
            mint TEXT,
            decimals INTEGER NOT NULL DEFAULT 9,
            enabled BOOLEAN NOT NULL DEFAULT TRUE,
            kind TEXT NOT NULL DEFAULT 'spl'
        )
    `);

    // ------- CHARACTERS (cursors / skins / leagues) -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS characters (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT NOT NULL,
            league_group TEXT NOT NULL,
            tap_bonus INTEGER NOT NULL DEFAULT 0,
            passive_bonus INTEGER NOT NULL DEFAULT 0,
            rarity TEXT NOT NULL DEFAULT 'common',
            description TEXT NOT NULL DEFAULT ''
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_characters (
            telegram_id BIGINT NOT NULL,
            character_id TEXT NOT NULL,
            acquired_at BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY (telegram_id, character_id)
        )
    `);

    // ------- LEADERBOARD PRIZES (per-league/per-character prize pools) -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS leaderboard_prizes (
            id BIGSERIAL PRIMARY KEY,
            season_id TEXT NOT NULL,
            league_group TEXT NOT NULL DEFAULT 'global',
            rank_min INTEGER NOT NULL,
            rank_max INTEGER NOT NULL,
            reward_token TEXT,
            reward_token_amount NUMERIC NOT NULL DEFAULT 0,
            reward_points BIGINT NOT NULL DEFAULT 0,
            label TEXT NOT NULL DEFAULT ''
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS seasons (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            starts_at BIGINT NOT NULL,
            ends_at BIGINT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active'
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS season_scores (
            season_id TEXT NOT NULL,
            telegram_id BIGINT NOT NULL,
            league_group TEXT NOT NULL DEFAULT 'global',
            points BIGINT NOT NULL DEFAULT 0,
            updated_at BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY (season_id, telegram_id, league_group)
        )
    `);

    // ------- TOURNAMENTS -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS tournaments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            icon TEXT NOT NULL DEFAULT '🏆',
            entry_token TEXT,
            entry_amount NUMERIC NOT NULL DEFAULT 0,
            entry_points BIGINT NOT NULL DEFAULT 0,
            prize_pool NUMERIC NOT NULL DEFAULT 0,
            prize_token TEXT,
            starts_at BIGINT NOT NULL,
            ends_at BIGINT NOT NULL,
            status TEXT NOT NULL DEFAULT 'upcoming',
            metric TEXT NOT NULL DEFAULT 'taps',
            max_players INTEGER NOT NULL DEFAULT 0
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS tournament_entries (
            tournament_id TEXT NOT NULL,
            telegram_id BIGINT NOT NULL,
            score BIGINT NOT NULL DEFAULT 0,
            joined_at BIGINT NOT NULL,
            paid_token TEXT,
            paid_amount NUMERIC NOT NULL DEFAULT 0,
            paid_signature TEXT,
            paid_points BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY (tournament_id, telegram_id)
        )
    `);

    // ------- FOLLOW MISSIONS -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS follow_missions (
            id TEXT PRIMARY KEY,
            platform TEXT NOT NULL,
            action TEXT NOT NULL,
            target TEXT NOT NULL,
            reward BIGINT NOT NULL DEFAULT 0,
            title TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT '🔗',
            verify TEXT NOT NULL DEFAULT 'manual',
            active BOOLEAN NOT NULL DEFAULT TRUE
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_follow_missions (
            telegram_id BIGINT NOT NULL,
            mission_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
            verified_at BIGINT NOT NULL DEFAULT 0,
            PRIMARY KEY (telegram_id, mission_id)
        )
    `);

    // ------- ADS (rewarded video / interstitial logs) -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ad_views (
            id BIGSERIAL PRIMARY KEY,
            telegram_id BIGINT NOT NULL,
            placement TEXT NOT NULL,
            reward_kind TEXT NOT NULL,
            reward_amount BIGINT NOT NULL DEFAULT 0,
            provider TEXT NOT NULL DEFAULT 'unknown',
            provider_ref TEXT,
            view_date DATE NOT NULL,
            created_at BIGINT NOT NULL
        )
    `);

    // ------- CHESTS -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chests (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT NOT NULL DEFAULT '📦',
            price_token TEXT NOT NULL,
            price_amount NUMERIC NOT NULL DEFAULT 0,
            min_points BIGINT NOT NULL DEFAULT 0,
            max_points BIGINT NOT NULL DEFAULT 0,
            drop_table TEXT NOT NULL DEFAULT '[]'
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_chests (
            id BIGSERIAL PRIMARY KEY,
            telegram_id BIGINT NOT NULL,
            chest_id TEXT NOT NULL,
            opened_at BIGINT NOT NULL,
            payment_token TEXT,
            payment_amount NUMERIC NOT NULL DEFAULT 0,
            payment_signature TEXT,
            reward_json TEXT NOT NULL DEFAULT '{}'
        )
    `);

    // ------- REFERRAL TIERS + CLAIMS -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS referral_tiers (
            tier INTEGER PRIMARY KEY,
            threshold INTEGER NOT NULL,
            reward_points BIGINT NOT NULL DEFAULT 0,
            reward_token TEXT,
            reward_token_amount NUMERIC NOT NULL DEFAULT 0,
            perk TEXT,
            label TEXT NOT NULL DEFAULT ''
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS referral_tier_claims (
            telegram_id BIGINT NOT NULL,
            tier INTEGER NOT NULL,
            claimed_at BIGINT NOT NULL,
            PRIMARY KEY (telegram_id, tier)
        )
    `);

    // ------- RAFFLES -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS raffles (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            icon TEXT NOT NULL DEFAULT '🎟️',
            prize_token TEXT,
            prize_amount NUMERIC NOT NULL DEFAULT 0,
            prize_description TEXT NOT NULL DEFAULT '',
            ticket_token TEXT,
            ticket_price NUMERIC NOT NULL DEFAULT 0,
            ticket_points BIGINT NOT NULL DEFAULT 0,
            starts_at BIGINT NOT NULL,
            ends_at BIGINT NOT NULL,
            status TEXT NOT NULL DEFAULT 'open',
            winner_telegram_id BIGINT,
            drawn_at BIGINT NOT NULL DEFAULT 0,
            random_seed TEXT
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS raffle_tickets (
            id BIGSERIAL PRIMARY KEY,
            raffle_id TEXT NOT NULL,
            telegram_id BIGINT NOT NULL,
            ticket_count INTEGER NOT NULL DEFAULT 1,
            paid_token TEXT,
            paid_amount NUMERIC NOT NULL DEFAULT 0,
            paid_points BIGINT NOT NULL DEFAULT 0,
            paid_signature TEXT,
            created_at BIGINT NOT NULL
        )
    `);

    // ------- TOKEN PAYMENTS / PURCHASES -------
    await pool.query(`
        CREATE TABLE IF NOT EXISTS token_payments (
            id BIGSERIAL PRIMARY KEY,
            telegram_id BIGINT NOT NULL,
            purpose TEXT NOT NULL,
            target_id TEXT,
            token_id TEXT NOT NULL,
            amount NUMERIC NOT NULL DEFAULT 0,
            signature TEXT,
            sender_address TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at BIGINT NOT NULL,
            confirmed_at BIGINT NOT NULL DEFAULT 0,
            error_message TEXT
        )
    `);

    // ------- SEED DATA -------
    for (const upgrade of DEFAULT_UPGRADES) {
        await pool.query(
            `
                INSERT INTO upgrades (
                    id, name, points_per_hour, category, icon, base_cost, cost_multiplier,
                    max_level, effect_per_level, effect_type, description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    points_per_hour = EXCLUDED.points_per_hour,
                    category = EXCLUDED.category,
                    icon = EXCLUDED.icon,
                    base_cost = EXCLUDED.base_cost,
                    cost_multiplier = EXCLUDED.cost_multiplier,
                    max_level = EXCLUDED.max_level,
                    effect_per_level = EXCLUDED.effect_per_level,
                    effect_type = EXCLUDED.effect_type,
                    description = EXCLUDED.description
            `,
            [
                upgrade.id,
                upgrade.name,
                getPointsPerHour(upgrade),
                upgrade.category,
                upgrade.icon,
                upgrade.baseCost,
                upgrade.costMultiplier,
                upgrade.maxLevel,
                upgrade.effectPerLevel,
                upgrade.effectType,
                upgrade.description,
            ]
        );
    }

    for (const token of DEFAULT_TOKENS) {
        await pool.query(
            `
                INSERT INTO tokens (id, symbol, name, icon, mint, decimals, enabled, kind)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE SET
                    symbol = EXCLUDED.symbol,
                    name = EXCLUDED.name,
                    icon = EXCLUDED.icon,
                    mint = EXCLUDED.mint,
                    decimals = EXCLUDED.decimals,
                    kind = EXCLUDED.kind
            `,
            [token.id, token.symbol, token.name, token.icon, token.mint, token.decimals, token.enabled, token.kind]
        );
    }

    for (const character of DEFAULT_CHARACTERS) {
        await pool.query(
            `
                INSERT INTO characters (id, name, icon, league_group, tap_bonus, passive_bonus, rarity, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    icon = EXCLUDED.icon,
                    league_group = EXCLUDED.league_group,
                    tap_bonus = EXCLUDED.tap_bonus,
                    passive_bonus = EXCLUDED.passive_bonus,
                    rarity = EXCLUDED.rarity,
                    description = EXCLUDED.description
            `,
            [character.id, character.name, character.icon, character.leagueGroup, character.tapBonus, character.passiveBonus, character.rarity, character.description]
        );
    }

    for (const chest of DEFAULT_CHESTS) {
        await pool.query(
            `
                INSERT INTO chests (id, name, icon, price_token, price_amount, min_points, max_points, drop_table)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    icon = EXCLUDED.icon,
                    price_token = EXCLUDED.price_token,
                    price_amount = EXCLUDED.price_amount,
                    min_points = EXCLUDED.min_points,
                    max_points = EXCLUDED.max_points,
                    drop_table = EXCLUDED.drop_table
            `,
            [chest.id, chest.name, chest.icon, chest.priceToken, chest.priceAmount, chest.minPoints, chest.maxPoints, chest.dropTable]
        );
    }

    for (const mission of DEFAULT_FOLLOW_MISSIONS) {
        await pool.query(
            `
                INSERT INTO follow_missions (id, platform, action, target, reward, title, icon, verify, active)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                ON CONFLICT (id) DO UPDATE SET
                    platform = EXCLUDED.platform,
                    action = EXCLUDED.action,
                    target = EXCLUDED.target,
                    reward = EXCLUDED.reward,
                    title = EXCLUDED.title,
                    icon = EXCLUDED.icon,
                    verify = EXCLUDED.verify,
                    active = EXCLUDED.active
            `,
            [mission.id, mission.platform, mission.action, mission.target, mission.reward, mission.title, mission.icon, mission.verify, mission.active]
        );
    }

    for (const tier of DEFAULT_REFERRAL_TIERS) {
        await pool.query(
            `
                INSERT INTO referral_tiers (tier, threshold, reward_points, reward_token, reward_token_amount, perk, label)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (tier) DO UPDATE SET
                    threshold = EXCLUDED.threshold,
                    reward_points = EXCLUDED.reward_points,
                    reward_token = EXCLUDED.reward_token,
                    reward_token_amount = EXCLUDED.reward_token_amount,
                    perk = EXCLUDED.perk,
                    label = EXCLUDED.label
            `,
            [tier.tier, tier.threshold, tier.rewardPoints, tier.rewardToken, tier.rewardTokenAmount, tier.perk, tier.label]
        );
    }

    // Seed active season if none exists
    const seasonRes = await pool.query(`SELECT id FROM seasons WHERE status = 'active' LIMIT 1`);
    if (seasonRes.rows.length === 0) {
        const now = Date.now();
        const seasonId = `s_${new Date(now).getUTCFullYear()}_${(new Date(now).getUTCMonth() + 1).toString().padStart(2, '0')}`;
        const startsAt = now;
        const endsAt = now + 30 * 24 * 60 * 60 * 1000;
        await pool.query(
            `INSERT INTO seasons (id, name, starts_at, ends_at, status) VALUES ($1, $2, $3, $4, 'active') ON CONFLICT (id) DO NOTHING`,
            [seasonId, 'Season ' + seasonId, startsAt, endsAt]
        );

        const prizes = [
            { rmin: 1, rmax: 1, token: 'sol', amt: '200000000', pts: 500000, label: '#1 — 0.2 SOL + 500k pts' },
            { rmin: 2, rmax: 3, token: 'sol', amt: '100000000', pts: 250000, label: '#2-3 — 0.1 SOL + 250k pts' },
            { rmin: 4, rmax: 10, token: 'sol', amt: '50000000', pts: 100000, label: '#4-10 — 0.05 SOL + 100k pts' },
            { rmin: 11, rmax: 50, token: null, amt: '0', pts: 25000, label: '#11-50 — 25k pts' },
            { rmin: 51, rmax: 100, token: null, amt: '0', pts: 10000, label: '#51-100 — 10k pts' },
        ];

        for (const prize of prizes) {
            await pool.query(
                `INSERT INTO leaderboard_prizes (season_id, league_group, rank_min, rank_max, reward_token, reward_token_amount, reward_points, label)
                 VALUES ($1, 'global', $2, $3, $4, $5, $6, $7)`,
                [seasonId, prize.rmin, prize.rmax, prize.token, prize.amt, prize.pts, prize.label]
            );
        }
    }

    // Seed sample tournament + raffle for showcase
    const tournamentRes = await pool.query(`SELECT id FROM tournaments WHERE status IN ('active', 'upcoming') LIMIT 1`);
    if (tournamentRes.rows.length === 0) {
        const now = Date.now();
        await pool.query(
            `INSERT INTO tournaments (id, name, description, icon, entry_token, entry_amount, entry_points, prize_pool, prize_token, starts_at, ends_at, status, metric, max_players)
             VALUES ('weekly_tap', 'Weekly Tap Cup', 'Top 10 by taps in 7 days share the SOL pool.', '🏆', NULL, 0, 5000, 1000000000, 'sol', $1, $2, 'active', 'taps', 0)
             ON CONFLICT (id) DO NOTHING`,
            [now, now + 7 * 24 * 60 * 60 * 1000]
        );
    }

    const raffleRes = await pool.query(`SELECT id FROM raffles WHERE status = 'open' LIMIT 1`);
    if (raffleRes.rows.length === 0) {
        const now = Date.now();
        await pool.query(
            `INSERT INTO raffles (id, name, description, icon, prize_token, prize_amount, prize_description, ticket_token, ticket_price, ticket_points, starts_at, ends_at, status)
             VALUES ('weekly_raffle', 'Weekly Mega Raffle', 'Buy tickets, more tickets = more chances.', '🎟️', 'sol', 500000000, '0.5 SOL Grand Prize', 'sol', 1000000, 10000, $1, $2, 'open')
             ON CONFLICT (id) DO NOTHING`,
            [now, now + 7 * 24 * 60 * 60 * 1000]
        );
    }

    console.log('✅ Database migrations completed');
}

module.exports = {
    migrateDatabase,
    DEFAULT_UPGRADES,
    DEFAULT_TOKENS,
    DEFAULT_CHESTS,
    DEFAULT_CHARACTERS,
    DEFAULT_FOLLOW_MISSIONS,
    DEFAULT_REFERRAL_TIERS,
};
