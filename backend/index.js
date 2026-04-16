require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const db = require('./database');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());
app.use(express.json());

// ============ FUNCTII HELPER ============

function getOrCreateUser(telegramId, username, firstName, referrerId = null) {
  let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  
  if (!user) {
    db.prepare(`
      INSERT INTO users (telegram_id, username, first_name, referrer_id, last_collect)
      VALUES (?, ?, ?, ?, ?)
    `).run(telegramId, username, firstName, referrerId, Date.now());
    
    user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
    
    if (referrerId) {
      db.prepare('UPDATE users SET points = points + 500 WHERE telegram_id = ?').run(referrerId);
    }
  }
  
  return user;
}

function calculateOfflineEarnings(user) {
  const now = Date.now();
  const hoursPassed = (now - user.last_collect) / (1000 * 60 * 60);
  const maxHours = 8;
  const effectiveHours = Math.min(hoursPassed, maxHours);
  
  return Math.floor(effectiveHours * user.points_per_hour);
}

function collectOfflineEarnings(telegramId) {
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  if (!user) return 0;
  
  const earnings = calculateOfflineEarnings(user);
  
  db.prepare('UPDATE users SET points = points + ?, last_collect = ? WHERE telegram_id = ?')
    .run(earnings, Date.now(), telegramId);
  
  return earnings;
}

// ============ BOT TELEGRAM ============

bot.command('start', async (ctx) => {
  const referrerId = ctx.message.text.split(' ')[1];
  const user = getOrCreateUser(
    ctx.from.id,
    ctx.from.username,
    ctx.from.first_name,
    referrerId ? parseInt(referrerId) : null
  );
  
  const webAppUrl = process.env.WEBAPP_URL;
  
  await ctx.reply(
    `🎮 Bine ai venit la CyberTap, ${ctx.from.first_name}!\n\n` +
    `💰 Puncte: ${user.points}\n` +
    `⚡ Productie: ${user.points_per_hour}/ora\n\n` +
    `Apasa butonul de mai jos pentru a juca:`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎮 Joaca CyberTap', web_app: { url: webAppUrl } }],
          [{ text: '👥 Invita prieteni', callback_data: 'referral' }]
        ]
      }
    }
  );
});

bot.action('referral', async (ctx) => {
  const referralLink = `[t.me](https://t.me/${ctx.botInfo.username}?start=${ctx.from.id})`;
  const referralCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE referrer_id = ?').get(ctx.from.id);
  
  await ctx.reply(
    `👥 Sistemul tau de referral:\n\n` +
    `🔗 Link-ul tau: ${referralLink}\n\n` +
    `📊 Ai invitat: ${referralCount.count} persoane\n` +
    `💰 Primesti 500 puncte pentru fiecare invitatie!\n\n` +
    `Trimite link-ul prietenilor tai!`
  );
});

// ============ API ENDPOINTS ============

app.get('/api/user/:telegramId', (req, res) => {
  const telegramId = parseInt(req.params.telegramId);
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const offlineEarnings = calculateOfflineEarnings(user);
  const upgrades = db.prepare(`
    SELECT u.*, COALESCE(uu.level, 0) as level
    FROM upgrades u
    LEFT JOIN user_upgrades uu ON u.id = uu.upgrade_id AND uu.telegram_id = ?
  `).all(telegramId);
  
  res.json({
    ...user,
    offline_earnings: offlineEarnings,
    upgrades
  });
});

app.post('/api/tap', (req, res) => {
  const { telegramId, taps } = req.body;
  const maxTapsPerRequest = 50;
  const validTaps = Math.min(taps, maxTapsPerRequest);
  
  db.prepare('UPDATE users SET points = points + ? WHERE telegram_id = ?')
    .run(validTaps, telegramId);
  
  const user = db.prepare('SELECT points FROM users WHERE telegram_id = ?').get(telegramId);
  res.json({ points: user.points });
});

app.post('/api/collect', (req, res) => {
  const { telegramId } = req.body;
  const earnings = collectOfflineEarnings(telegramId);
  const user = db.prepare('SELECT points FROM users WHERE telegram_id = ?').get(telegramId);
  
  res.json({ collected: earnings, points: user.points });
});

app.post('/api/upgrade', (req, res) => {
  const { telegramId, upgradeId } = req.body;
  
  const user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  const upgrade = db.prepare('SELECT * FROM upgrades WHERE id = ?').get(upgradeId);
  
  if (!user || !upgrade) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const userUpgrade = db.prepare('SELECT * FROM user_upgrades WHERE telegram_id = ? AND upgrade_id = ?')
    .get(telegramId, upgradeId);
  const currentLevel = userUpgrade ? userUpgrade.level : 0;
  
  const cost = Math.floor(upgrade.base_cost * Math.pow(1.5, currentLevel));
  
  if (user.points < cost) {
    return res.status(400).json({ error: 'Not enough points' });
  }
  
  db.prepare('UPDATE users SET points = points - ?, points_per_hour = points_per_hour + ? WHERE telegram_id = ?')
    .run(cost, upgrade.points_per_hour, telegramId);
  
  db.prepare(`
    INSERT INTO user_upgrades (telegram_id, upgrade_id, level) 
    VALUES (?, ?, 1)
    ON CONFLICT(telegram_id, upgrade_id) 
    DO UPDATE SET level = level + 1
  `).run(telegramId, upgradeId);
  
  const updatedUser = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramId);
  
  res.json({
    success: true,
    points: updatedUser.points,
    points_per_hour: updatedUser.points_per_hour,
    new_level: currentLevel + 1
  });
});

app.get('/api/leaderboard', (req, res) => {
  const leaders = db.prepare(`
    SELECT telegram_id, username, first_name, points, points_per_hour
    FROM users
    ORDER BY points DESC
    LIMIT 100
  `).all();
  
  res.json(leaders);
});

app.post('/api/daily', (req, res) => {
  const { telegramId } = req.body;
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  let daily = db.prepare('SELECT * FROM daily_rewards WHERE telegram_id = ?').get(telegramId);
  
  if (!daily) {
    db.prepare('INSERT INTO daily_rewards (telegram_id, last_claim, streak) VALUES (?, 0, 0)').run(telegramId);
    daily = { last_claim: 0, streak: 0 };
  }
  
  const timeSinceClaim = now - daily.last_claim;
  
  if (timeSinceClaim < oneDayMs) {
    const timeLeft = oneDayMs - timeSinceClaim;
    return res.status(400).json({ 
      error: 'Already claimed', 
      time_left: timeLeft 
    });
  }
  
  let newStreak = daily.streak + 1;
  if (timeSinceClaim > 2 * oneDayMs) {
    newStreak = 1;
  }
  
  const reward = 100 * newStreak;
  
  db.prepare('UPDATE daily_rewards SET last_claim = ?, streak = ? WHERE telegram_id = ?')
    .run(now, newStreak, telegramId);
  
  db.prepare('UPDATE users SET points = points + ? WHERE telegram_id = ?')
    .run(reward, telegramId);
  
  const user = db.prepare('SELECT points FROM users WHERE telegram_id = ?').get(telegramId);
  
  res.json({
    reward,
    streak: newStreak,
    points: user.points
  });
});

// ============ START ============

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

bot.launch().then(() => {
  console.log('Bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
