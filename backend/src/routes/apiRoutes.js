const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { requireTelegramId } = require('../middleware/validateTelegramId');
const apiController = require('../controllers/apiController');

const router = express.Router();

router.get('/user/:telegramId', requireTelegramId('params'), asyncHandler(apiController.getUser));
router.post('/tap', requireTelegramId('body'), asyncHandler(apiController.tap));
router.post('/collect', requireTelegramId('body'), asyncHandler(apiController.collect));
router.post('/upgrade', requireTelegramId('body'), asyncHandler(apiController.upgrade));
router.get('/leaderboard', asyncHandler(apiController.leaderboard));
router.post('/daily', requireTelegramId('body'), asyncHandler(apiController.daily));
router.post('/wheel_spin', requireTelegramId('body'), asyncHandler(apiController.wheelSpin));
router.get('/rank/:telegramId', requireTelegramId('params'), asyncHandler(apiController.rank));
router.get('/botinfo', asyncHandler(apiController.botInfo));

module.exports = router;
