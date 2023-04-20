require('dotenv').config()

const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const PostgresSession = require('telegraf-postgres-session');

const env = process.env.NODE_ENV || 'development';
const config = require('../../config/config')[env];

const bot = new Telegraf(process.env.TELEGRAM_BOT_API_TOKEN);

bot.use((new PostgresSession({
    user: config.username,
    password: config.password,
    host: config.host,
    database: config.database,
    ssl: config.ssl
})).middleware());

bot.command('quit', async (ctx) => {
    await ctx.leaveChat();
});

bot.on(message('text'), async (ctx) => {
    if (!ctx.session.messageCount)
        ctx.session.messageCount = 0

    ctx.session.messageCount++
    await ctx.reply(`Hello ${ctx.update.message.from.first_name}, count: ${ctx.session.messageCount}`);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;