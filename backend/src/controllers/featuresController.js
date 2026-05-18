const seasonService = require('../services/seasonService');
const tournamentService = require('../services/tournamentService');
const followMissionService = require('../services/followMissionService');
const adService = require('../services/adService');
const chestService = require('../services/chestService');
const referralService = require('../services/referralService');
const autoClickerService = require('../services/autoClickerService');
const characterService = require('../services/characterService');
const raffleService = require('../services/raffleService');
const tokenService = require('../services/tokenService');

// ----- TOKENS -----
async function listTokens(req, res) {
    const tokens = await tokenService.listTokens();
    res.json(tokens);
}

// ----- SEASON / LEADERBOARD PRIZES -----
async function getSeason(req, res) {
    const season = await seasonService.getActiveSeason();
    const prizes = await seasonService.getSeasonPrizes();
    res.json({ season, prizes: prizes.prizes });
}

async function getSeasonLeaderboard(req, res) {
    const leagueGroup = req.query.league || 'global';
    const limit = req.query.limit || 100;
    const result = await seasonService.getSeasonLeaderboard({ leagueGroup, limit });
    res.json(result);
}

async function getSeasonRank(req, res) {
    const leagueGroup = req.query.league || 'global';
    const rank = await seasonService.getUserSeasonRank(req.telegramId, leagueGroup);
    res.json({ rank });
}

// ----- TOURNAMENTS -----
async function listTournaments(req, res) {
    const tournaments = await tournamentService.listTournaments();
    res.json(tournaments);
}

async function getTournament(req, res) {
    const tournament = await tournamentService.getTournament(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    const entries = await tournamentService.getEntries(req.params.id, { limit: 25 });
    res.json({ tournament, entries });
}

async function joinTournament(req, res) {
    const result = await tournamentService.joinTournament({
        telegramId: req.telegramId,
        tournamentId: req.body.tournamentId,
        signature: req.body.signature,
        senderAddress: req.body.senderAddress,
    });
    res.json(result);
}

async function getMyTournaments(req, res) {
    const rows = await tournamentService.getUserActiveTournaments(req.telegramId);
    res.json(rows);
}

// ----- FOLLOW MISSIONS -----
async function listFollowMissions(req, res) {
    const rows = await followMissionService.listFollowMissions(req.telegramId);
    res.json(rows);
}

async function startFollowMission(req, res) {
    const mission = await followMissionService.markMissionStarted(req.telegramId, req.body.missionId);
    res.json({ success: true, mission });
}

async function claimFollowMission(req, res) {
    const result = await followMissionService.claimMission(req.telegramId, req.body.missionId);
    res.json(result);
}

// ----- ADS -----
async function getAdConfig(req, res) {
    const config = await adService.getAdConfig(req.telegramId);
    res.json(config);
}

async function rewardForAdView(req, res) {
    const result = await adService.rewardForAdView({
        telegramId: req.telegramId,
        placement: req.body.placement,
        rewardId: req.body.rewardId,
        providerRef: req.body.providerRef,
        provider: req.body.provider,
    });
    res.json(result);
}

// ----- CHESTS -----
async function listChests(req, res) {
    const chests = await chestService.listChests();
    res.json(chests);
}

async function openChest(req, res) {
    const result = await chestService.openChest({
        telegramId: req.telegramId,
        chestId: req.body.chestId,
        signature: req.body.signature,
        senderAddress: req.body.senderAddress,
    });
    res.json(result);
}

async function getChestHistory(req, res) {
    const rows = await chestService.getUserChestHistory(req.telegramId);
    res.json(rows);
}

// ----- REFERRAL TIERS -----
async function getReferralProgress(req, res) {
    const data = await referralService.getReferralProgress(req.telegramId);
    res.json(data);
}

async function claimReferralTier(req, res) {
    const result = await referralService.claimReferralTier(req.telegramId, req.body.tier);
    res.json(result);
}

// ----- AUTO-CLICKER -----
async function getAutoClickerStatus(req, res) {
    const status = await autoClickerService.getStatus(req.telegramId);
    res.json(status);
}

async function activateAutoClicker(req, res) {
    const result = await autoClickerService.activate({
        telegramId: req.telegramId,
        signature: req.body.signature,
        senderAddress: req.body.senderAddress,
        level: req.body.level,
    });
    res.json(result);
}

async function collectAutoClicker(req, res) {
    const result = await autoClickerService.collectCatchup(req.telegramId);
    res.json(result);
}

// ----- CHARACTERS -----
async function listCharacters(req, res) {
    const all = await characterService.listCharacters();
    res.json(all);
}

async function listMyCharacters(req, res) {
    const rows = await characterService.listUserCharacters(req.telegramId);
    res.json(rows);
}

async function selectCharacter(req, res) {
    const result = await characterService.selectCharacter(req.telegramId, req.body.characterId);
    res.json(result);
}

// ----- RAFFLES -----
async function listRaffles(req, res) {
    const raffles = await raffleService.listRaffles();
    res.json(raffles);
}

async function getRaffle(req, res) {
    const summary = await raffleService.getRaffleSummary(req.params.id, req.query.telegramId ? Number(req.query.telegramId) : null);
    if (!summary) return res.status(404).json({ error: 'Raffle not found' });
    res.json(summary);
}

async function buyRaffleTickets(req, res) {
    const result = await raffleService.buyTickets({
        telegramId: req.telegramId,
        raffleId: req.body.raffleId,
        ticketCount: req.body.ticketCount,
        payWith: req.body.payWith || 'points',
        signature: req.body.signature,
        senderAddress: req.body.senderAddress,
    });
    res.json(result);
}

async function drawRaffle(req, res) {
    // Admin gate: require ADMIN_KEY header to match env
    if (!process.env.ADMIN_KEY || req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await raffleService.drawWinner(req.params.id);
    res.json(result);
}

module.exports = {
    listTokens,
    getSeason,
    getSeasonLeaderboard,
    getSeasonRank,
    listTournaments,
    getTournament,
    joinTournament,
    getMyTournaments,
    listFollowMissions,
    startFollowMission,
    claimFollowMission,
    getAdConfig,
    rewardForAdView,
    listChests,
    openChest,
    getChestHistory,
    getReferralProgress,
    claimReferralTier,
    getAutoClickerStatus,
    activateAutoClicker,
    collectAutoClicker,
    listCharacters,
    listMyCharacters,
    selectCharacter,
    listRaffles,
    getRaffle,
    buyRaffleTickets,
    drawRaffle,
};
