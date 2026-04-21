const {
    getOrCreateUser,
    getUserLeague,
    getUserRank,
    formatNum,
    getLeaderboard,
    findUserByTelegramId,
} = require('../services/userService');
const { getBotInfo } = require('../services/metaService');

function buildReferralLink(username, telegramId) {
    return `https://t.me/${username}?start=${telegramId}`;
}

function buildWelcomeMessage({ user, league, rank, referrerId, firstName, isNewUser }) {
    let message = '';

    if (isNewUser) {
        message += `🎮 *Welcome to CyberTap, ${firstName}!*\n\n`;
        if (referrerId) {
            message += `✅ *Referral bonus activated!* +500 points!\n\n`;
        }
    } else {
        message += `👋 *Welcome back, ${firstName}!*\n\n`;
    }

    message += `📊 *Your Stats:*\n\n`;
    message += `💰 Points: ${formatNum(user.points)}\n`;
    message += `⚡ Per Hour: ${formatNum(user.points_per_hour)}\n`;
    message += `${league.icon} League: ${league.name}\n`;
    message += `🏆 Rank: #${rank}\n`;
    message += `👥 Referrals: ${user.referral_count}\n`;
    message += `🔥 Streak: ${user.streak} days\n\n`;
    message += `Tap the button below to play! 👇`;

    return message;
}

function buildStatsMessage(user, league, rank) {
    return `
📊 *Your Statistics*

💰 Points: ${formatNum(user.points)}
🏅 All-time: ${formatNum(user.total_points)}

⚡ Per Hour: ${formatNum(user.points_per_hour)}
👆 Per Tap: ${user.tap_value}
💥 Critical: ${user.critical_chance}%

${league.icon} League: ${league.name}
🏆 Rank: #${rank}

👥 Friends Invited: ${user.referral_count}
🔥 Daily Streak: ${user.streak} days
    `;
}

async function registerBotHandlers(bot) {
    bot.command('start', async (ctx) => {
        try {
            const startParam = ctx.message.text.split(' ')[1];
            const referrerId = startParam ? parseInt(startParam, 10) : null;

            const user = await getOrCreateUser(
                ctx.from.id,
                ctx.from.username,
                ctx.from.first_name,
                referrerId
            );

            const league = getUserLeague(parseInt(user.total_points, 10) || 0);
            const rank = await getUserRank(ctx.from.id);
            const isNewUser = !user.created_at || (Date.now() - parseInt(user.created_at, 10)) < 5000;
            const message = buildWelcomeMessage({
                user,
                league,
                rank,
                referrerId,
                firstName: ctx.from.first_name,
                isNewUser,
            });

            await ctx.reply(message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🎮 Play CyberTap', web_app: { url: 'https://industrious-integrity-production-5d74.up.railway.app' } }],
                        [{ text: '👥 Invite Friends', callback_data: 'referral' }],
                        [
                            { text: '📊 My Stats', callback_data: 'stats' },
                            { text: '🏆 Leaderboard', callback_data: 'leaderboard' },
                        ],
                    ],
                },
            });
        } catch (err) {
            console.error('Start command error:', err);
            await ctx.reply('❌ Error. Please try again with /start');
        }
    });

    bot.command('stats', async (ctx) => {
        try {
            const user = await findUserByTelegramId(ctx.from.id);
            if (!user) {
                await ctx.reply('❌ Please use /start first!');
                return;
            }

            const league = getUserLeague(parseInt(user.total_points, 10) || 0);
            const rank = await getUserRank(ctx.from.id);

            await ctx.reply(buildStatsMessage(user, league, rank), {
                parse_mode: 'Markdown',
            });
        } catch (err) {
            console.error('Stats error:', err);
        }
    });

    bot.command('top', async (ctx) => {
        try {
            const rows = await getLeaderboard(10);
            const medals = ['🥇', '🥈', '🥉'];
            let message = '🏆 *Top 10 Players*\n\n';

            rows.forEach((player, index) => {
                const name = player.first_name || player.username || 'Anonymous';
                const league = getUserLeague(parseInt(player.total_points, 10) || 0);
                const medal = medals[index] || `${index + 1}.`;
                message += `${medal} ${league.icon} *${name}*\n`;
                message += `    └ ${formatNum(player.total_points)} points\n\n`;
            });

            const userRank = await getUserRank(ctx.from.id);
            const userRow = await findUserByTelegramId(ctx.from.id);

            if (userRow) {
                const userLeague = getUserLeague(parseInt(userRow.total_points, 10) || 0);
                message += `━━━━━━━━━━━━━━\n`;
                message += `📍 You: #${userRank} ${userLeague.icon} ${formatNum(userRow.total_points)} pts`;
            }

            await ctx.reply(message, { parse_mode: 'Markdown' });
        } catch (err) {
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

    bot.action('referral', async (ctx) => {
        await ctx.answerCbQuery();
        try {
            const botInfo = await getBotInfo(bot);
            const referralLink = buildReferralLink(botInfo.username, ctx.from.id);
            const user = await findUserByTelegramId(ctx.from.id);
            const count = user?.referral_count || 0;

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
        } catch (err) {
            console.error('Referral error:', err);
        }
    });

    bot.action('stats', async (ctx) => {
        await ctx.answerCbQuery();
        const user = await findUserByTelegramId(ctx.from.id);
        if (!user) return;

        const league = getUserLeague(parseInt(user.total_points, 10) || 0);

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
        const rows = await getLeaderboard(5);
        const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
        let message = '🏆 *Top 5 Players*\n\n';

        rows.forEach((player, index) => {
            const name = player.first_name || player.username || 'Anonymous';
            message += `${medals[index]} *${name}*: ${formatNum(player.total_points)}\n`;
        });

        await ctx.reply(message, { parse_mode: 'Markdown' });
    });
}

module.exports = {
    registerBotHandlers,
};
