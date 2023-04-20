require('dotenv').config()

const { Telegraf, Scenes} = require('telegraf');
const { message } = require('telegraf/filters');
const PostgresSession = require('telegraf-postgres-session');
const {mainWithStartKeyboard, settingsButton, backKeyboard} = require("./keyboard");
const log = require("../log");
const models = require("../../models");

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

const stage = new Scenes.Stage([
    // options
]);

bot.start(async (ctx) => {
    await initNewChat(ctx)
});

bot.on(message('group_chat_created'), async (ctx) => {
    await initNewChat(ctx)
})

bot.on(message('new_chat_members'), async (ctx) => {
    if (ctx.message.new_chat_members.find(e => e.id === ctx.botInfo.id) !== undefined) {
        await initNewChat(ctx)
    }
});

bot.hears(settingsButton, async (ctx) => {
    await ctx.reply('Settings', backKeyboard)
});

const initNewChat = async (ctx) => {
    const [job, created] = await models.Job.findOrCreate({
        where: {
            id: ctx.update.message.chat.id
        },
        defaults: {
            id: ctx.update.message.chat.id,
        }
    })

    await ctx.reply('Hey! I am a GraphQL Pingator. I will rapidly alert you in case something has broken 🔥', mainWithStartKeyboard)
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;