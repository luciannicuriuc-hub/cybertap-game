async function getBotInfo(bot) {
    try {
        if (!bot?.telegram?.getMe) {
            throw new Error('Bot client unavailable');
        }

        const botInfo = await bot.telegram.getMe();
        return {
            id: botInfo.id,
            username: botInfo.username,
            first_name: botInfo.first_name,
        };
    } catch (error) {
        return {
            id: null,
            username: (process.env.TELEGRAM_BOT_NAME || process.env.BOT_USERNAME || '').replace(/^@/, ''),
            first_name: process.env.BOT_FIRST_NAME || 'CyberTap Bot',
            error: error.message,
        };
    }
}

function getHealthStatus() {
    return {
        status: '✅ CyberTap API Running',
        version: '2.0',
        timestamp: new Date().toISOString(),
    };
}

module.exports = {
    getBotInfo,
    getHealthStatus,
};
