require('dotenv').config()

const { Telegraf, Scenes} = require('telegraf');
const { message } = require('telegraf/filters');
const PostgresSession = require('telegraf-postgres-session');
const {mainWithStartKeyboard, settingsButton, backKeyboard} = require("./keyboard");
const log = require("../log");
const models = require("../../models");

const options = require("./scenes/options/index")

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
    options
]);

bot.use(stage.middleware())

bot.start(async (ctx) => {
    await findOrCreateNewChat(ctx)
});

bot.on(message('group_chat_created'), async (ctx) => {
    await findOrCreateNewChat(ctx)
})

bot.on(message('new_chat_members'), async (ctx) => {
    if (ctx.message.new_chat_members.find(e => e.id === ctx.botInfo.id) !== undefined) {
        await findOrCreateNewChat(ctx)
    }
});

bot.hears(settingsButton, async (ctx) => {
    await ctx.scene.enter('options')
});

const findOrCreateNewChat = async (ctx) => {
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