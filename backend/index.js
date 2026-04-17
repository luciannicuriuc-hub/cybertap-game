require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
const { Pool } = require('pg');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use(cors());
app.use(express.json());

// ============================================================
// DATABASE CONNECTION
// ============================================================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ============================================================
// DATABASE INITIALIZATION
// ============================================================
async function initDB() {
    try {
        // USERS TABLE - Main player data
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                telegram_id BIGINT PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                points BIGINT DEFAULT 0,
                total_points BIGINT DEFAULT 0,
                points_per_hour BIGINT DEFAULT 0,
                tap_value INT DEFAULT 1,
                critical_chance INT DEFAULT 0,
                energy INT DEFAULT 1000,
                max_energy INT DEFAULT 1000,
                energy_regen INT DEFAULT 1,
                bonus_percent INT DEFAULT 0,
                last_collect BIGINT DEFAULT 0,
                referrer_id BIGINT,
                referral_count INT DEFAULT 0,
                streak INT DEFAULT 0,
                last_login DATE,
                created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
            )
        `);

        // UPGRADES TABLE - Available upgrades catalog
        await pool.query(`
            CREATE TABLE IF NOT EXISTS upgrades (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                base_cost BIGINT NOT NULL,
                cost_multiplier REAL DEFAULT 1.5,
                max_level INT DEFAULT 50,
                effect_per_level INT DEFAULT 1,
                effect_type TEXT NOT NULL,
                icon TEXT,
                description TEXT
            )
        `);

        // USER UPGRADES TABLE - What each player owns
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_upgrades (
                telegram_id BIGINT,
                upgrade_id TEXT,
                level INT DEFAULT 0,
                PRIMARY KEY (telegram_id, upgrade_id)
            )
        `);

        // DAILY REWARDS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS daily_rewards (
                telegram_id BIGINT PRIMARY KEY,
                last_claim BIGINT DEFAULT 0,
                streak INT DEFAULT 0
            )
        `);

        // WHEEL SPINS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS wheel_spins (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT,
                spin_date DATE,
                reward TEXT,
                points_received BIGINT DEFAULT 0,
                special_received TEXT,
                created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
            )
        `);

        // MISSIONS PROGRESS TABLE
        await pool.query(`
            CREATE TABLE IF NOT EXISTS mission_progress (
                id SERIAL PRIMARY KEY,
                telegram_id BIGINT,
                mission_id TEXT,
                mission_type TEXT,
                progress INT DEFAULT 0,
                completed BOOLEAN DEFAULT FALSE,
                reset_at DATE,
                UNIQUE(telegram_id, mission_id)
            )
        `);

        // Insert default upgrades if empty
        const { rows } = await pool.query(
            'SELECT COUNT(*) as count FROM upgrades'
        );

        if (parseInt(rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO upgrades 
                (id, name, category, base_cost, cost_multiplier, 
                 max_level, effect_per_level, effect_type, icon, description)
                VALUES
                -- TAP UPGRADES
                ('multi_tap', 'Multi-Tap', 'tap', 
                 500, 1.5, 50, 1, 'tap_value', '👆', 
                 '+1 point per tap'),

                ('energy_max', 'Energy Tank', 'tap', 
                 1000, 1.4, 30, 500, 'max_energy', '🔋', 
                 '+500 max energy'),

                ('energy_regen', 'Power Supply', 'tap', 
                 2000, 1.6, 20, 1, 'energy_regen', '⚡', 
                 '+1 energy/sec regen'),

                ('critical_tap', 'Critical Strike', 'tap', 
                 5000, 1.8, 15, 5, 'critical_chance', '💥', 
                 '+5% critical hit chance'),

                -- PASSIVE INCOME UPGRADES
                ('gpu_basic', 'Basic GPU', 'passive', 
                 1000, 1.3, 100, 10, 'passive_income', '🖥️', 
                 '+10 points/hour'),

                ('server_rack', 'Server Rack', 'passive', 
                 5000, 1.35, 50, 50, 'passive_income', '🗄️', 
                 '+50 points/hour'),

                ('data_center', 'Data Center', 'passive', 
                 25000, 1.4, 30, 200, 'passive_income', '🏢', 
                 '+200 points/hour'),

                ('bot_network', 'Bot Network', 'passive', 
                 100000, 1.45, 20, 500, 'passive_income', '🤖', 
                 '+500 points/hour'),

                ('ai_system', 'AI Supercomputer', 'passive', 
                 500000, 1.5, 15, 2000, 'passive_income', '🧠', 
                 '+2000 points/hour'),

                ('quantum_cpu', 'Quantum CPU', 'passive', 
                 2000000, 1.6, 10, 5000, 'passive_income', '⚛️', 
                 '+5000 points/hour'),

                -- SPECIAL UPGRADES
                ('vpn_premium', 'VPN Premium', 'special', 
                 50000, 2.0, 5, 10, 'bonus_percent', '🔐', 
                 '+10% to all earnings'),

                ('dark_web', 'Dark Web Access', 'special', 
                 100000, 2.0, 5, 15, 'passive_bonus', '🌐', 
                 '+15% passive income'),

                ('ai_assistant', 'AI Assistant', 'special', 
                 200000, 2.0, 5, 1, 'auto_tap', '🤖', 
                 'Auto-tap while offline')
            `);

            console.log('✅ Default upgrades inserted');
        }

        console.log('✅ Database ready!');

    } catch(err) {
        console.error('❌ Database init error:', err);
    }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Get or create a user
async function getOrCreateUser(
    telegramId, username, firstName, referrerId = null
) {
    const { rows } = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    if (rows.length > 0) return rows[0];

    // New user - create account
    await pool.query(`
        INSERT INTO users (
            telegram_id, username, first_name, 
            referrer_id, last_collect, last_login
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
    `, [telegramId, username, firstName, referrerId, Date.now()]);

    // Give referral bonus to the person who invited this user
    if (referrerId && referrerId !== telegramId) {
        await pool.query(`
            UPDATE users SET 
                points = points + 500,
                total_points = total_points + 500,
                referral_count = referral_count + 1
            WHERE telegram_id = $1
        `, [referrerId]);

        console.log(`✅ Referral bonus given to ${referrerId}`);
    }

    const result = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [telegramId]
    );
    return result.rows[0];
}

// Calculate offline earnings (max 8 hours)
function calculateOfflineEarnings(user) {
    const now = Date.now();
    const lastCollect = parseInt(user.last_collect) || now;
    const hoursPassed = (now - lastCollect) / (1000 * 60 * 60);
    const maxHours = 8;
    const effectiveHours = Math.min(hoursPassed, maxHours);
    const pointsPerHour = parseInt(user.points_per_hour) || 0;

    return Math.floor(effectiveHours * pointsPerHour);
}

// Get user's current league
function getUserLeague(totalPoints) {
    const leagues = [
        { name: 'Bronze',    icon: '🥉', min: 0 },
        { name: 'Silver',    icon: '🥈', min: 10000 },
        { name: 'Gold',      icon: '🥇', min: 50000 },
        { name: 'Diamond',   icon: '💎', min: 200000 },
        { name: 'Elite',     icon: '👑', min: 1000000 },
        { name: 'Legendary', icon: '🔥', min: 10000000 },
        { name: 'Mythic',    icon: '⚡', min: 100000000 }
    ];

    let current = leagues[0];
    for (const league of leagues) {
        if (totalPoints >= league.min) current = league;
        else break;
    }
    return current;
}

// Format large numbers
function formatNum(num) {
    num = Math.floor(num);
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000)    return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000)       return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ============================================================
// TELEGRAM BOT COMMANDS
// ============================================================

bot.command('start', async (ctx) => {
    try {
        // Check for referral in start parameter
        const startParam = ctx.message.text.split(' ')[1];
        const referrerId = startParam ? parseInt(startParam) : null;

        const user = await getOrCreateUser(
            ctx.from.id,
            ctx.from.username,
            ctx.from.first_name,
            referrerId
        );

        const league = getUserLeague(
            parseInt(user.total_points) || 0
        );

        // Get user rank
        const rankRes = await pool.query(`
            SELECT COUNT(*) + 1 as rank 
            FROM users 
            WHERE total_points > $1
        `, [user.total_points || 0]);

        const rank = rankRes.rows[0].rank;

        const isNewUser = !user.created_at ||
            (Date.now() - parseInt(user.created_at)) < 5000;

        let message = '';

        if (isNewUser) {
            message = `🎮 *Welcome to CyberTap, ${ctx.from.first_name}!*\n\n`;
            if (referrerId) {
                message += `✅ *Referral bonus activated!* +500 points!\n\n`;
            }
        } else {
            message = `👋 *Welcome back, ${ctx.from.first_name}!*\n\n`;
        }

        message += `📊 *Your Stats:*\n\n`;
        message += `💰 Points: ${formatNum(user.points)}\n`;
        message += `⚡ Per Hour: ${formatNum(user.points_per_hour)}\n`;
        message += `${league.icon} League: ${league.name}\n`;
        message += `🏆 Rank: #${rank}\n`;
        message += `👥 Referrals: ${user.referral_count}\n`;
        message += `🔥 Streak: ${user.streak} days\n\n`;
        message += `Tap the button below to play! 👇`;

        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🎮 Play CyberTap',
                        web_app: { url: process.env.WEBAPP_URL }
                    }],
                    [{
                        text: '👥 Invite Friends',
                        callback_data: 'referral'
                    }],
                    [
                        {
                            text: '📊 My Stats',
                            callback_data: 'stats'
                        },
                        {
                            text: '🏆 Leaderboard',
                            callback_data: 'leaderboard'
                        }
                    ]
                ]
            }
        });

    } catch(err) {
        console.error('Start command error:', err);
        await ctx.reply('❌ Error. Please try again with /start');
    }
});

bot.command('stats', async (ctx) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [ctx.from.id]
        );

        if (rows.length === 0) {
            await ctx.reply('❌ Please use /start first!');
            return;
        }

        const user = rows[0];
        const league = getUserLeague(parseInt(user.total_points) || 0);
        const rankRes = await pool.query(`
            SELECT COUNT(*) + 1 as rank FROM users 
            WHERE total_points > $1
        `, [user.total_points || 0]);

        await ctx.reply(`
📊 *Your Statistics*

💰 Points: ${formatNum(user.points)}
🏅 All-time: ${formatNum(user.total_points)}

⚡ Per Hour: ${formatNum(user.points_per_hour)}
👆 Per Tap: ${user.tap_value}
💥 Critical: ${user.critical_chance}%

${league.icon} League: ${league.name}
🏆 Rank: #${rankRes.rows[0].rank}

👥 Friends Invited: ${user.referral_count}
🔥 Daily Streak: ${user.streak} days
        `, { parse_mode: 'Markdown' });

    } catch(err) {
        console.error('Stats error:', err);
    }
});

bot.command('top', async (ctx) => {
    try {
        const { rows } = await pool.query(`
            SELECT telegram_id, first_name, username, 
                   total_points, points
            FROM users 
            ORDER BY total_points DESC 
            LIMIT 10
        `);

        const medals = ['🥇', '🥈', '🥉'];
        let message = '🏆 *Top 10 Players*\n\n';

        rows.forEach((player, i) => {
            const name = player.first_name ||
                         player.username ||
                         'Anonymous';
            const league = getUserLeague(
                parseInt(player.total_points) || 0
            );
            const medal = medals[i] || `${i + 1}.`;
            message += `${medal} ${league.icon} *${name}*\n`;
            message += `    └ ${formatNum(player.total_points)} points\n\n`;
        });

        // Add user's own rank
        const userRank = await pool.query(`
            SELECT COUNT(*) + 1 as rank FROM users 
            WHERE total_points > (
                SELECT total_points FROM users 
                WHERE telegram_id = $1
            )
        `, [ctx.from.id]);

        const userRow = await pool.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [ctx.from.id]
        );

        if (userRow.rows.length > 0) {
            const u = userRow.rows[0];
            const uLeague = getUserLeague(
                parseInt(u.total_points) || 0
            );
            message += `━━━━━━━━━━━━━━\n`;
            message += `📍 You: #${userRank.rows[0].rank} `;
            message += `${uLeague.icon} ${formatNum(u.total_points)} pts`;
        }

        await ctx.reply(message, { parse_mode: 'Markdown' });

    } catch(err) {
        console.error('Top command error:', err);
    }
});

bot.command('help', async (ctx) => {
    await ctx.reply(`
🎮 *CyberTap - How to Play*

👆 *Tap* the button to earn points
⚡ *Energy* refills over time
💰 *Upgrades* boost your earnings
🎁 *Daily reward* for logging in
👥 *Invite friends* for bonus points

*Commands:*
/start - Open the game
/stats - Your statistics  
/top - Leaderboard
/help - This message

*Pro Tips:* 💡
• Keep your daily streak for bigger rewards
• Buy passive upgrades to earn while offline
• Invite friends to earn 5% of their points!
    `, { parse_mode: 'Markdown' });
});

// Callback handlers
bot.action('referral', async (ctx) => {
    await ctx.answerCbQuery();
    try {
        const botInfo = await bot.telegram.getMe();
        const referralLink =
            `[t.me](https://t.me/${botInfo.username}?start=${ctx.from.id})`;

        const { rows } = await pool.query(
            'SELECT referral_count FROM users WHERE telegram_id = $1',
            [ctx.from.id]
        );
        const count = rows[0]?.referral_count || 0;

        await ctx.reply(`
👥 *Invite Friends & Earn Together!*

🔗 *Your Link:*
\`${referralLink}\`

📊 *Stats:*
• Friends Invited: *${count}*
• Per Invite: *+500 points*
• Passive: *5% of their earnings*

🎯 *Milestones:*
• 3 friends → 🔐 VPN Premium
• 5 friends → 🏅 Recruiter Badge  
• 10 friends → 🤖 AI Assistant
• 25 friends → 👕 Exclusive Skin
• 50 friends → 🏆 Network Master
• 100 friends → 👑 VIP Status
        `, { parse_mode: 'Markdown' });

    } catch(err) {
        console.error('Referral error:', err);
    }
});

bot.action('stats', async (ctx) => {
    await ctx.answerCbQuery();
    ctx.message = { text: '/stats' };
    // Redirect to stats
    const { rows } = await pool.query(
        'SELECT * FROM users WHERE telegram_id = $1',
        [ctx.from.id]
    );
    if (rows.length === 0) return;

    const user = rows[0];
    const league = getUserLeague(parseInt(user.total_points) || 0);

    await ctx.reply(`
📊 *Your Stats*

💰 ${formatNum(user.points)} points
${league.icon} ${league.name} League
🔥 ${user.streak} day streak
👥 ${user.referral_count} friends invited
    `, { parse_mode: 'Markdown' });
});

bot.action('leaderboard', async (ctx) => {
    await ctx.answerCbQuery();
    const { rows } = await pool.query(`
        SELECT first_name, username, total_points
        FROM users ORDER BY total_points DESC LIMIT 5
    `);

    const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
    let message = '🏆 *Top 5 Players*\n\n';

    rows.forEach((p, i) => {
        const name = p.first_name || p.username || 'Anonymous';
        message += `${medals[i]} *${name}*: ${formatNum(p.total_points)}\n`;
    });

    await ctx.reply(message, { parse_mode: 'Markdown' });
});

// ============================================================
// API ROUTES
// ============================================================

// GET user data
app.get('/api/user/:telegramId', async (req, res) => {
    try {
        const telegramId = parseInt(req.params.telegramId);

        let { rows } = await pool.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        // Create user if doesn't exist
        if (rows.length === 0) {
            await getOrCreateUser(telegramId, null, 'Player');
            const result = await pool.query(
                'SELECT * FROM users WHERE telegram_id = $1',
                [telegramId]
            );
            rows = result.rows;
        }

        const user = rows[0];
        const offlineEarnings = calculateOfflineEarnings(user);

        // Get user upgrades
        const upgradesRes = await pool.query(`
            SELECT u.id, u.name, u.category, u.icon,
                   u.base_cost, u.cost_multiplier, u.max_level,
                   u.effect_per_level, u.effect_type, u.description,
                   COALESCE(uu.level, 0) as level
            FROM upgrades u
            LEFT JOIN user_upgrades uu 
                ON u.id = uu.upgrade_id 
                AND uu.telegram_id = $1
            ORDER BY u.category, u.base_cost
        `, [telegramId]);

        res.json({
            ...user,
            offline_earnings: offlineEarnings,
            upgrades: upgradesRes.rows
        });

    } catch(err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST tap
app.post('/api/tap', async (req, res) => {
    try {
        const { telegramId, taps, tapValue } = req.body;

        // Security: limit max taps per request
        const validTaps = Math.min(parseInt(taps) || 1, 200);
        const validTapValue = Math.min(parseInt(tapValue) || 1, 1000);
        const totalPoints = validTaps * validTapValue;

        await pool.query(`
            UPDATE users SET 
                points = points + $1,
                total_points = total_points + $1
            WHERE telegram_id = $2
        `, [totalPoints, telegramId]);

        const { rows } = await pool.query(
            'SELECT points, total_points FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        res.json({
            points: rows[0].points,
            total_points: rows[0].total_points
        });

    } catch(err) {
        console.error('Tap error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST collect passive income
app.post('/api/collect', async (req, res) => {
    try {
        const { telegramId } = req.body;

        const { rows } = await pool.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        if (rows.length === 0) {
            return res.json({ collected: 0, points: 0 });
        }

        const earnings = calculateOfflineEarnings(rows[0]);

        if (earnings > 0) {
            await pool.query(`
                UPDATE users SET 
                    points = points + $1,
                    total_points = total_points + $1,
                    last_collect = $2
                WHERE telegram_id = $3
            `, [earnings, Date.now(), telegramId]);
        }

        const updated = await pool.query(
            'SELECT points FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        res.json({
            collected: earnings,
            points: updated.rows[0].points
        });

    } catch(err) {
        console.error('Collect error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST buy upgrade
app.post('/api/upgrade', async (req, res) => {
    try {
        const { telegramId, upgradeId } = req.body;

        // Get user
        const userRes = await pool.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [telegramId]
        );
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get upgrade info
        const upgradeRes = await pool.query(
            'SELECT * FROM upgrades WHERE id = $1',
            [upgradeId]
        );
        if (upgradeRes.rows.length === 0) {
            return res.status(404).json({ error: 'Upgrade not found' });
        }

        const user = userRes.rows[0];
        const upgrade = upgradeRes.rows[0];

        // Get current level
        const lvlRes = await pool.query(`
            SELECT level FROM user_upgrades 
            WHERE telegram_id = $1 AND upgrade_id = $2
        `, [telegramId, upgradeId]);

        const currentLevel = lvlRes.rows.length > 0
            ? lvlRes.rows[0].level
            : 0;

        // Check max level
        if (currentLevel >= upgrade.max_level) {
            return res.status(400).json({
                error: 'Maximum level reached'
            });
        }

        // Calculate cost
        const cost = Math.floor(
            parseInt(upgrade.base_cost) *
            Math.pow(parseFloat(upgrade.cost_multiplier), currentLevel)
        );

        // Check points
        if (parseInt(user.points) < cost) {
            return res.status(400).json({
                error: 'Not enough points',
                required: cost,
                current: user.points
            });
        }

        // Deduct points
        await pool.query(`
            UPDATE users SET points = points - $1
            WHERE telegram_id = $2
        `, [cost, telegramId]);

        // Update upgrade level
        await pool.query(`
            INSERT INTO user_upgrades (telegram_id, upgrade_id, level)
            VALUES ($1, $2, 1)
            ON CONFLICT (telegram_id, upgrade_id)
            DO UPDATE SET level = user_upgrades.level + 1
        `, [telegramId, upgradeId]);

        // Apply effect based on type
        const effect = parseInt(upgrade.effect_per_level);
        const effectType = upgrade.effect_type;

        if (effectType === 'tap_value') {
            await pool.query(`
                UPDATE users SET tap_value = tap_value + $1
                WHERE telegram_id = $2
            `, [effect, telegramId]);

        } else if (effectType === 'max_energy') {
            await pool.query(`
                UPDATE users SET 
                    max_energy = max_energy + $1,
                    energy = LEAST(energy + $1, max_energy + $1)
                WHERE telegram_id = $2
            `, [effect, telegramId]);

        } else if (effectType === 'energy_regen') {
            await pool.query(`
                UPDATE users SET energy_regen = energy_regen + $1
                WHERE telegram_id = $2
            `, [effect, telegramId]);

        } else if (effectType === 'critical_chance') {
            await pool.query(`
                UPDATE users SET critical_chance = critical_chance + $1
                WHERE telegram_id = $2
            `, [effect, telegramId]);

        } else if (effectType === 'passive_income') {
            await pool.query(`
                UPDATE users SET points_per_hour = points_per_hour + $1
                WHERE telegram_id = $2
            `, [effect, telegramId]);

        } else if (effectType === 'bonus_percent') {
            await pool.query(`
                UPDATE users SET bonus_percent = bonus_percent + $1
                WHERE telegram_id = $2
            `, [effect, telegramId]);
        }

        // Get updated user
        const updated = await pool.query(
            'SELECT * FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        res.json({
            success: true,
            new_level: currentLevel + 1,
            cost: cost,
            points: updated.rows[0].points,
            points_per_hour: updated.rows[0].points_per_hour,
            tap_value: updated.rows[0].tap_value
        });

    } catch(err) {
        console.error('Upgrade error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT 
                telegram_id,
                username,
                first_name,
                points,
                total_points,
                points_per_hour,
                referral_count,
                streak
            FROM users
            ORDER BY total_points DESC
            LIMIT 100
        `);

        res.json(rows);

    } catch(err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST daily reward
app.post('/api/daily', async (req, res) => {
    try {
        const { telegramId } = req.body;
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;

        // Create daily record if not exists
        await pool.query(`
            INSERT INTO daily_rewards (telegram_id, last_claim, streak)
            VALUES ($1, 0, 0)
            ON CONFLICT DO NOTHING
        `, [telegramId]);

        const { rows } = await pool.query(
            'SELECT * FROM daily_rewards WHERE telegram_id = $1',
            [telegramId]
        );

        const daily = rows[0];
        const timeSinceClaim = now - parseInt(daily.last_claim);

        // Check if already claimed
        if (timeSinceClaim < oneDayMs) {
            return res.status(400).json({
                error: 'Already claimed',
                time_left: oneDayMs - timeSinceClaim
            });
        }

        // Calculate new streak
        const twoDaysMs = 2 * oneDayMs;
        let newStreak = timeSinceClaim > twoDaysMs
            ? 1
            : parseInt(daily.streak) + 1;

        // Calculate reward based on streak
        let reward = 100 * newStreak;

        // Bonus rewards for milestones
        if (newStreak === 7)  reward = 10000;
        if (newStreak === 14) reward = 25000;
        if (newStreak === 21) reward = 50000;
        if (newStreak === 30) reward = 100000;

        // Update daily record
        await pool.query(`
            UPDATE daily_rewards 
            SET last_claim = $1, streak = $2
            WHERE telegram_id = $3
        `, [now, newStreak, telegramId]);

        // Give reward to user
        await pool.query(`
            UPDATE users SET 
                points = points + $1,
                total_points = total_points + $1,
                streak = $2,
                last_login = CURRENT_DATE
            WHERE telegram_id = $3
        `, [reward, newStreak, telegramId]);

        const updated = await pool.query(
            'SELECT points FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        res.json({
            reward: reward,
            streak: newStreak,
            points: updated.rows[0].points
        });

    } catch(err) {
        console.error('Daily reward error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST wheel spin
app.post('/api/wheel_spin', async (req, res) => {
    try {
        const { telegramId, reward, points, special } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Check if already spun today
        const { rows } = await pool.query(`
            SELECT id FROM wheel_spins
            WHERE telegram_id = $1 AND spin_date = $2
        `, [telegramId, today]);

        if (rows.length > 0) {
            return res.status(400).json({
                error: 'Already spun today'
            });
        }

        // Record spin
        await pool.query(`
            INSERT INTO wheel_spins 
            (telegram_id, spin_date, reward, points_received, special_received)
            VALUES ($1, $2, $3, $4, $5)
        `, [telegramId, today, reward, points || 0, special]);

        // Give points if any
        if (points && points > 0) {
            await pool.query(`
                UPDATE users SET 
                    points = points + $1,
                    total_points = total_points + $1
                WHERE telegram_id = $2
            `, [points, telegramId]);
        }

        // Apply special rewards
        if (special === 'energy_full') {
            await pool.query(`
                UPDATE users SET energy = max_energy
                WHERE telegram_id = $1
            `, [telegramId]);
        }

        const updated = await pool.query(
            'SELECT points FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        res.json({
            success: true,
            points: updated.rows[0]?.points || 0
        });

    } catch(err) {
        console.error('Wheel spin error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET user rank
app.get('/api/rank/:telegramId', async (req, res) => {
    try {
        const telegramId = parseInt(req.params.telegramId);

        const { rows } = await pool.query(`
            SELECT COUNT(*) + 1 as rank
            FROM users
            WHERE total_points > (
                SELECT total_points FROM users
                WHERE telegram_id = $1
            )
        `, [telegramId]);

        res.json({ rank: rows[0].rank });

    } catch(err) {
        console.error('Rank error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check route
app.get('/', (req, res) => {
    res.json({
        status: '✅ CyberTap API Running',
        version: '2.0',
        timestamp: new Date().toISOString()
    });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// Initialize database
initDB();

// Start Telegram bot
bot.launch()
    .then(() => console.log('✅ Bot started successfully!'))
    .catch(err => console.error('❌ Bot start error:', err));

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
