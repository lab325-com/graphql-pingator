import { Markup, Scenes, Telegraf } from 'telegraf';
import PostgresSession from 'telegraf-postgres-session';
import { message } from 'telegraf/filters';
import configs from '@config/sequelizeConfig';
import {
	PAGINATION_NEXT_PAGE_BUTTON,
	PAGINATION_PAGE_BUTTON,
	PAGINATION_PREVIOUS_PAGE_BUTTON
} from '@constants/Pagination';
import { EVENT_NAME_GROUP_CHAT_CREATED, EVENT_NAME_NEW_CHAT_MEMBERS } from '@constants/Event';

const env = process.env.NODE_ENV || 'local';
const config = configs[env];

class TelegramBot {
	
	_botInstance;
	
	_stage;
	
	/**
	 *
	 * @param botApiToken
	 * @param scenes
	 * @param commands {[command_name]: [handler]}
	 */
	constructor(botApiToken, scenes, commands) {
		this._botInstance = new Telegraf(botApiToken);
		
		if (!scenes.every(e => e instanceof Scenes.BaseScene || e instanceof Scenes.WizardScene))
			throw new Error(`Scenes has elements that are not scenes`);
		
		this._stage = new Scenes.Stage(scenes);
		
		this._botInstance.use((new PostgresSession({
			user: config.username,
			...config
		})).middleware());
		
		this._botInstance.use(this._stage.middleware());
		
		this._botInstance.start(async context => await this.sendGreetingMessage(context));
		
		this._botInstance.on(message(EVENT_NAME_GROUP_CHAT_CREATED), async context => await this.sendGreetingMessage(context));
		
		this._botInstance.on(message(EVENT_NAME_NEW_CHAT_MEMBERS), async context => {
			if (context.message.new_chat_members.find(e => e.id === context.botInfo.id))
				await this.sendGreetingMessage(context);
		});
		
		for (const commandName in commands)
			this._botInstance.command(commandName, commands[commandName]);
	}
	
	static isMessageNullOrEmpty(context) {
		return Boolean(context.message?.text?.trim() === '');
	}
	
	static async sendValidationFailedMessage(context, paramName) {
		await context.replyWithHTML(`🚫 <b>Invalid ${paramName} was sent.</b> Enter ${paramName} again!`);
	}
	
	/**
	 * Creates inline pagination keyboard
	 * @param rows {[id]: string}
	 * @param callbackDataSelector
	 * @param currentPage
	 * @param totalPages
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
	
	async sendMessage(chatId, message, extra = null) {
		await this._botInstance.telegram.sendMessage(chatId, message, extra);
	}
	
	launch() {
		this._botInstance.launch();
	}
	
	async sendGreetingMessage(context) {
		await context.reply('Hey! I am a GraphQL Pingator. I will rapidly alert you in case something has broken 🔥\n\nClick /endpoints and start working with me.');
	}
}

export default TelegramBot;