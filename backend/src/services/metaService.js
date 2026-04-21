async function getBotInfo(bot) {
    const botInfo = await bot.telegram.getMe();
    return {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name,
    };
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
