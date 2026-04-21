require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createApp } = require('./src/app');
const { registerBotHandlers } = require('./src/bot/registerHandlers');
const { pool } = require('./src/config/db');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = createApp(bot);

registerBotHandlers(bot);

const PORT = process.env.PORT || 3000;

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
];

async function migrateDatabase() {
    console.log('🔄 Running database migrations...');

    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            telegram_id BIGINT PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            referrer_id BIGINT,
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
            last_login DATE,
            created_at BIGINT NOT NULL DEFAULT ((EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT)
        )
    `);

    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS referrer_id BIGINT`);
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
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login DATE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at BIGINT NOT NULL DEFAULT ((EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT)`);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS upgrades (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
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

    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_upgrades (
            telegram_id BIGINT NOT NULL,
            upgrade_id TEXT NOT NULL,
            level INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (telegram_id, upgrade_id)
        )
    `);

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

    for (const upgrade of DEFAULT_UPGRADES) {
        await pool.query(
            `
                INSERT INTO upgrades (
                    id, name, category, icon, base_cost, cost_multiplier,
                    max_level, effect_per_level, effect_type, description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
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

    console.log('✅ Database migrations completed');
}

async function start() {
    try {
        await migrateDatabase();

        app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });

        await bot.launch();
        console.log('✅ Bot started successfully!');
    } catch (error) {
        console.error('❌ Startup error:', error);
    }
}

start();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
