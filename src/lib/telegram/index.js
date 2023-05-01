import { config } from 'dotenv';
config();

import { Scenes, Telegraf } from 'telegraf';
import PostgresSession from 'telegraf-postgres-session';
import { message } from 'telegraf/filters';
import endpoints from './scenes/endpoints/index';
import addEndpoint from './scenes/endpoints/add';
import deleteEndpoint from './scenes/endpoints/delete';
import editEndpoint from './scenes/endpoints/edit';
import { SCENE_NAME_ENDPOINTS } from '@constants/Scene';

const env = process.env.NODE_ENV || 'development';
const sequelizeConfig = require('../../config/sequelizeConfig')[env];
const telegramConfig = require('../../config/telegramConfig')[env];

const bot = new Telegraf(telegramConfig.token);

bot.use((new PostgresSession(sequelizeConfig)).middleware());

const stage = new Scenes.Stage([
	endpoints,
	addEndpoint,
	deleteEndpoint,
	editEndpoint
]);

bot.use(stage.middleware());

bot.start(async (context) => await sendGreetingMessage(context));

bot.on(message('group_chat_created'), async (context) => await sendGreetingMessage(context));

bot.on(message('new_chat_members'), async (context) => {
	if (context.message.new_chat_members.find(e => e.id === context.botInfo.id))
		await sendGreetingMessage(context);
});

bot.command('help', async (context) => {
	await context.replyWithHTML('Here is list of commands (not so long xD):' +
		'\n/endpoints - shows list of endpoints');
});

bot.command('endpoints', async (context) =>
	await context.scene.enter(SCENE_NAME_ENDPOINTS));

const sendGreetingMessage = async (context) => {
	await context.reply('Hey! I am a GraphQL Pingator. I will rapidly alert you in case something has broken 🔥\n\nType /endpoints and start working with me.');
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;