require('dotenv').config()

const { Telegraf, Scenes} = require('telegraf');
const { message } = require('telegraf/filters');
const PostgresSession = require('telegraf-postgres-session');

const endpoints = require("./scenes/endpoints/index")
const addEndpoint = require("./scenes/endpoints/add");
const deleteEndpoint = require("./scenes/endpoints/delete");
const editEndpoint = require("./scenes/endpoints/edit");

const {SCENE_NAME_ENDPOINTS} = require("../../constants/Scene");

const env = process.env.NODE_ENV || 'development';
const config = require('../../config/sequelizeConfig')[env];

const token = env === 'development'
    ? process.env.DEV_TELEGRAM_BOT_API_TOKEN
    : process.env.TELEGRAM_BOT_API_TOKEN

const bot = new Telegraf(token);

bot.use((new PostgresSession({
    user: config.username,
    password: config.password,
    host: config.host,
    database: config.database,
    ssl: config.ssl
})).middleware());

const stage = new Scenes.Stage([
    endpoints,
    addEndpoint,
    deleteEndpoint,
    editEndpoint
]);

bot.use(stage.middleware())

bot.start(async (ctx) => {
    await sendGreetingMessage(ctx)
});

bot.on(message('group_chat_created'), async (ctx) => {
    await sendGreetingMessage(ctx)
})

bot.on(message('new_chat_members'), async (ctx) => {
    if (ctx.message.new_chat_members.find(e => e.id === ctx.botInfo.id) !== undefined) {
        await sendGreetingMessage(ctx)
    }
});

bot.command('help', async (ctx) => {
    await ctx.replyWithHTML('Here is list of commands (not so long xD):' +
        '\n/endpoints - shows list of endpoints')
})

bot.command('endpoints', async (ctx) => {
    await ctx.scene.enter(SCENE_NAME_ENDPOINTS)
});

const sendGreetingMessage = async (ctx) => {
    await ctx.reply('Hey! I am a GraphQL Pingator. I will rapidly alert you in case something has broken 🔥\n\nType /endpoints and start working with me.')
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;