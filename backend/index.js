require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createApp } = require('./src/app');
const { registerBotHandlers } = require('./src/bot/registerHandlers');
const { pool } = require('./src/config/db');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = createApp(bot);

registerBotHandlers(bot);

const PORT = process.env.PORT || 3000;

// Database migration function
async function migrateDatabase() {
    try {
        console.log('🔄 Running database migrations...');

        // Add missing columns to users table
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS last_login DATE,
            ADD COLUMN IF NOT EXISTS total_points BIGINT DEFAULT 0
        `);

        console.log('✅ Database migrations completed');
    } catch (error) {
        console.error('❌ Database migration error:', error);
    }
}

app.listen(PORT, async () => {
    console.log(`✅ Server running on port ${PORT}`);
    await migrateDatabase();
});

bot.launch()
    .then(() => console.log('✅ Bot started successfully!'))
    .catch((err) => console.error('❌ Bot start error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
