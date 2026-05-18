const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireTelegramId } = require('../middleware/validateTelegramId');
const apiController = require('../controllers/apiController');
const features = require('../controllers/featuresController');

const router = express.Router();

// --- Core game ---
router.get('/user/:telegramId', requireTelegramId('params'), asyncHandler(apiController.getUser));
router.post('/tap', requireTelegramId('body'), asyncHandler(apiController.tap));
router.post('/collect', requireTelegramId('body'), asyncHandler(apiController.collect));
router.post('/upgrade', requireTelegramId('body'), asyncHandler(apiController.upgrade));
router.get('/leaderboard', asyncHandler(apiController.leaderboard));
router.post('/daily', requireTelegramId('body'), asyncHandler(apiController.daily));
router.post('/wheel_spin', requireTelegramId('body'), asyncHandler(apiController.wheelSpin));
router.get('/rank/:telegramId', requireTelegramId('params'), asyncHandler(apiController.rank));
router.get('/botinfo', asyncHandler(apiController.botInfo));

// --- Wallet / Web3 ---
router.get('/wallet/challenge/:telegramId', requireTelegramId('params'), asyncHandler(apiController.walletChallenge));
router.get('/wallet/status/:telegramId', requireTelegramId('params'), asyncHandler(apiController.walletStatus));
router.post('/wallet/verify', requireTelegramId('body'), asyncHandler(apiController.walletVerify));
router.post('/wallet/claim', requireTelegramId('body'), asyncHandler(apiController.revenueClaim));

// --- Tokens catalog ---
router.get('/tokens', asyncHandler(features.listTokens));

// --- Season leaderboard with prizes ---
router.get('/season', asyncHandler(features.getSeason));
router.get('/season/leaderboard', asyncHandler(features.getSeasonLeaderboard));
router.get('/season/rank/:telegramId', requireTelegramId('params'), asyncHandler(features.getSeasonRank));

// --- Tournaments ---
router.get('/tournaments', asyncHandler(features.listTournaments));
router.get('/tournaments/me/:telegramId', requireTelegramId('params'), asyncHandler(features.getMyTournaments));
router.get('/tournaments/:id', asyncHandler(features.getTournament));
router.post('/tournaments/join', requireTelegramId('body'), asyncHandler(features.joinTournament));

// --- Follow missions (social-to-earn) ---
router.get('/follow_missions/:telegramId', requireTelegramId('params'), asyncHandler(features.listFollowMissions));
router.post('/follow_missions/start', requireTelegramId('body'), asyncHandler(features.startFollowMission));
router.post('/follow_missions/claim', requireTelegramId('body'), asyncHandler(features.claimFollowMission));

// --- Ads ---
router.get('/ads/config/:telegramId', requireTelegramId('params'), asyncHandler(features.getAdConfig));
router.post('/ads/reward', requireTelegramId('body'), asyncHandler(features.rewardForAdView));

// --- Chests ---
router.get('/chests', asyncHandler(features.listChests));
router.post('/chests/open', requireTelegramId('body'), asyncHandler(features.openChest));
router.get('/chests/history/:telegramId', requireTelegramId('params'), asyncHandler(features.getChestHistory));

// --- Referral tiers ---
router.get('/referrals/:telegramId', requireTelegramId('params'), asyncHandler(features.getReferralProgress));
router.post('/referrals/claim', requireTelegramId('body'), asyncHandler(features.claimReferralTier));

// --- Auto-clicker ---
router.get('/autoclicker/:telegramId', requireTelegramId('params'), asyncHandler(features.getAutoClickerStatus));
router.post('/autoclicker/activate', requireTelegramId('body'), asyncHandler(features.activateAutoClicker));
router.post('/autoclicker/collect', requireTelegramId('body'), asyncHandler(features.collectAutoClicker));

// --- Characters / cursors ---
router.get('/characters', asyncHandler(features.listCharacters));
router.get('/characters/mine/:telegramId', requireTelegramId('params'), asyncHandler(features.listMyCharacters));
router.post('/characters/select', requireTelegramId('body'), asyncHandler(features.selectCharacter));

// --- Raffles ---
router.get('/raffles', asyncHandler(features.listRaffles));
router.get('/raffles/:id', asyncHandler(features.getRaffle));
router.post('/raffles/buy', requireTelegramId('body'), asyncHandler(features.buyRaffleTickets));
router.post('/raffles/:id/draw', asyncHandler(features.drawRaffle));

module.exports = router;
