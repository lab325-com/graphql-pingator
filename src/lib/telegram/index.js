import endpointsScene from './scenes/endpoints/list';
import addEndpoint from './scenes/endpoints/add';
import deleteEndpoint from './scenes/endpoints/delete';
import editEndpoint from './scenes/endpoints/edit';
import log from '@lib/log';
import TelegramBot from '@classes/TelegramBot';
import { TELEGRAM_BOT_API_TOKEN } from '@config/env';
import { SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import { COMMAND_NAME_ENDPOINTS, COMMAND_NAME_HELP } from '@constants/Command';

const telegramBot = new TelegramBot(TELEGRAM_BOT_API_TOKEN, [
	endpointsScene, addEndpoint, deleteEndpoint, editEndpoint
]);

const helpHandler = async context => {
	await context.replyWithHTML('Here is list of commands (not so long xD):' +
		'\n/endpoints - shows list of endpoints');
};

const commands = {
	[COMMAND_NAME_HELP]: helpHandler,
	[COMMAND_NAME_ENDPOINTS]: async context => await context.scene.enter(SCENE_NAME_ENDPOINTS)
};

telegramBot.init(commands).catch(log.error);

// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default telegramBot;