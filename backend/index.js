require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createApp } = require('./src/app');
const { registerBotHandlers } = require('./src/bot/registerHandlers');
const { pool } = require('./src/config/db');
const { migrateDatabase } = require('./src/database/migrate');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = createApp(bot);

registerBotHandlers(bot);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await migrateDatabase(pool);

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
