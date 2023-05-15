import endpointsListScene from './scenes/endpoints/list';
import addEndpointScene from './scenes/endpoints/add';
import deleteEndpointScene from './scenes/endpoints/delete';
import editEndpointScene from './scenes/endpoints/edit';
import TelegramBot from '@classes/TelegramBot';
import { TELEGRAM_BOT_API_TOKEN } from '@config/env';
import { SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import { COMMAND_NAME_ENDPOINTS, COMMAND_NAME_HELP } from '@constants/Command';

const helpHandler = async context => {
	await context.replyWithHTML('Here is list of commands (not so long xD):' +
		'\n/endpoints - shows list of endpoints');
};

const commands = {
	[COMMAND_NAME_HELP]: helpHandler,
	[COMMAND_NAME_ENDPOINTS]: async context => await context.scene.enter(SCENE_NAME_ENDPOINTS)
};

const scenes = [endpointsListScene, addEndpointScene, deleteEndpointScene, editEndpointScene];

const telegramBot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, scenes, commands);

// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default telegramBot;