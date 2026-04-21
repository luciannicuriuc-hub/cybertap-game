const {
    getUserProfile,
    getLeaderboard,
    getUserRank,
} = require('../services/userService');
const {
    applyTap,
    collectPassiveIncome,
    buyUpgrade,
    claimDailyReward,
    spinWheel,
} = require('../services/gameService');
const {
    createWalletChallenge,
    verifyWalletLink,
    getWalletStatus,
    claimRevenue,
} = require('../services/solanaService');
const { getBotInfo } = require('../services/metaService');

async function getUser(req, res) {
    const user = await getUserProfile(req.telegramId);
    res.json(user);
}

async function tap(req, res) {
    const result = await applyTap({
        telegramId: req.telegramId,
        taps: req.body.taps,
        tapValue: req.body.tapValue,
    });

    res.json(result);
}

async function collect(req, res) {
    const result = await collectPassiveIncome(req.telegramId);
    res.json(result);
}

async function upgrade(req, res) {
    const result = await buyUpgrade(req.telegramId, req.body.upgradeId);
    res.json(result);
}

async function leaderboard(req, res) {
    const limit = req.query.limit;
    const rows = await getLeaderboard(limit);
    res.json(rows);
}

async function daily(req, res) {
    const result = await claimDailyReward(req.telegramId);
    res.json(result);
}

async function wheelSpin(req, res) {
    const result = await spinWheel({
        telegramId: req.telegramId,
        reward: req.body.reward,
        points: req.body.points,
        special: req.body.special,
    });

    res.json(result);
}

async function rank(req, res) {
    const rankValue = await getUserRank(req.telegramId);
    res.json({ rank: rankValue });
}

async function botInfo(req, res) {
    const info = await getBotInfo(req.app.locals.bot);
    res.json(info);
}

async function walletChallenge(req, res) {
    const challenge = await createWalletChallenge(req.telegramId);
    res.json(challenge);
}

async function walletVerify(req, res) {
    const result = await verifyWalletLink(req.telegramId, req.body.walletAddress, req.body.signature);
    res.json(result);
}

async function walletStatus(req, res) {
    const status = await getWalletStatus(req.telegramId);
    res.json(status);
}

async function revenueClaim(req, res) {
    const result = await claimRevenue(req.telegramId);
    res.json(result);
}

module.exports = {
    getUser,
    tap,
    collect,
    upgrade,
    leaderboard,
    daily,
    wheelSpin,
    rank,
    botInfo,
    walletChallenge,
    walletVerify,
    walletStatus,
    revenueClaim,
};
