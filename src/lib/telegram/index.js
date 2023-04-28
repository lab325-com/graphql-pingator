require('dotenv').config();

const { Telegraf, Scenes } = require('telegraf');
const { message } = require('telegraf/filters');
const PostgresSession = require('telegraf-postgres-session');

const endpoints = require('./scenes/endpoints/index');
const addEndpoint = require('./scenes/endpoints/add');
const deleteEndpoint = require('./scenes/endpoints/delete');
const editEndpoint = require('./scenes/endpoints/edit');

const { SCENE_NAME_ENDPOINTS } = require('../../constants/Scene');

const env = process.env.NODE_ENV || 'development';
const sequelizeConfig = require('../../config/sequelizeConfig')[env];
const telegramConfig = require('../../config/telegramConfig')[env];

const bot = new Telegraf(telegramConfig.token);

bot.use((new PostgresSession({
	user: sequelizeConfig.username,
	password: sequelizeConfig.password,
	host: sequelizeConfig.host,
	database: sequelizeConfig.database,
	ssl: sequelizeConfig.ssl
})).middleware());

const stage = new Scenes.Stage([
	endpoints,
	addEndpoint,
	deleteEndpoint,
	editEndpoint
]);

bot.use(stage.middleware());

bot.start(async (context) => {
	await sendGreetingMessage(context);
});

bot.on(message('group_chat_created'), async (context) => {
	await sendGreetingMessage(context);
});

bot.on(message('new_chat_members'), async (context) => {
	if (context.message.new_chat_members.find(e => e.id === context.botInfo.id))
		await sendGreetingMessage(context);
});

bot.command('help', async (context) => {
	await context.replyWithHTML('Here is list of commands (not so long xD):' +
		'\n/endpoints - shows list of endpoints');
});

bot.command('endpoints', async (context) => {
	await context.scene.enter(SCENE_NAME_ENDPOINTS);
});

const sendGreetingMessage = async (context) => {
	await context.reply('Hey! I am a GraphQL Pingator. I will rapidly alert you in case something has broken 🔥\n\nType /endpoints and start working with me.');
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;