import { Scenes, Telegraf, Markup } from 'telegraf';
import PostgresSession from 'telegraf-postgres-session';
import { message } from 'telegraf/filters';
import configs from '@config/sequelizeConfig';
import {
	PAGINATION_NEXT_PAGE_BUTTON,
	PAGINATION_PAGE_BUTTON,
	PAGINATION_PREVIOUS_PAGE_BUTTON
} from '@constants/Pagination';
const env = process.env.NODE_ENV || 'local';
const config = configs[env];

class TelegramBot {
	
	_botInstance;
	
	_stage;
	
	constructor(botApiToken, scenes) {
		// TODO проверить, что бот создался
		this._botInstance = new Telegraf(botApiToken);
		// TODO проверить что каждый элемент scenes это инстанс сцены
		this._stage = new Scenes.Stage(scenes);
		
		this._botInstance.use((new PostgresSession({
			user: config.username,
			...config
		})).middleware());
		
		this._botInstance.use(this._stage.middleware());
	}
	
	static isMessageNullOrEmpty(context) {
		Boolean(context.message?.text?.trim() === '');
	}
	
	static async sendValidationFailedMessage(context, paramName) {
		await context.replyWithHTML(`🚫 <b>Invalid ${paramName} was sent.</b> Enter ${paramName} again!`);
	}
	
	static async sendLoadingMessage(context) {
		await context.replyWithHTML('Loading...');
	}
	
	async sendMessage(chatId, message, extra = null) {
		await this._botInstance.telegram.sendMessage(chatId, message, extra)
	}
	
	/**
	 *
	 * @param rows {[id]: string}
	 * @param callbackDataSelector
	 * @param currentPage
	 * @param pagesCount
	 * @param sceneId
	 * @returns {Markup<InlineKeyboardMarkup>}
	 */
	static createPaginationKeyboard({ rows, currentPage = 0, totalPages, sceneId }) {
		const buttons = [];
		
		for (const key in rows) {
			buttons.push([Markup.button.callback(rows[key], this.createButtonId(sceneId, key))]);
		}
		
		buttons.push([
			Markup.button.callback(`⬅️`, this.createButtonId(sceneId, PAGINATION_PREVIOUS_PAGE_BUTTON)),
			Markup.button.callback(`page ${currentPage + 1}/${totalPages}`, PAGINATION_PAGE_BUTTON),
			Markup.button.callback(`➡️`, this.createButtonId(sceneId, PAGINATION_NEXT_PAGE_BUTTON))
		]);
		
		return Markup.inlineKeyboard(buttons);
	}
	
	static parseButtonId(buttonId) {
		const [sceneId, buttonName] = buttonId.split('_');
		
		return { sceneId, buttonName };
	}
	
	static createButtonId(sceneId, buttonId) {
		return `${sceneId}_${buttonId}`;
	}
	
	/**
	 *
	 * @param commands {[command_name]: [handler]}
	 * @returns {Promise<void>}
	 */
	async init(commands) {
		this._botInstance.start(async context => await this.sendGreetingMessage(context));
		
		// TODO make constant from 'group_chat_created'
		this._botInstance.on(message('group_chat_created'), async context => await this.sendGreetingMessage(context));
		// TODO make constant from 'new_chat_members'
		this._botInstance.on(message('new_chat_members'), async context => {
			if (context.message.new_chat_members.find(e => e.id === context.botInfo.id))
				await this.sendGreetingMessage(context);
		});
		
		for (const commandName in commands)
			this._botInstance.command(commandName, commands[commandName]);
	}
	
	launch() {
		this._botInstance.launch();
	}
	
	async sendGreetingMessage(context) {
		await context.reply('Hey! I am a GraphQL Pingator. I will rapidly alert you in case something has broken 🔥\n\nClick /endpoints and start working with me.');
	}
}

export default TelegramBot;