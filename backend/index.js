require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createApp } = require('./src/app');
const { registerBotHandlers } = require('./src/bot/registerHandlers');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = createApp(bot);

registerBotHandlers(bot);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

bot.launch()
    .then(() => console.log('✅ Bot started successfully!'))
    .catch((err) => console.error('❌ Bot start error:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
