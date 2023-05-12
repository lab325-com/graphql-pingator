import TelegramBot from '@classes/TelegramBot';
import { COMMAND_NAME_SAVE } from '@constants/Command';

export default async context => {
	const paramName = 'interval';
	
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	const interval = parseInt(context.message.text);
	if (isNaN(interval) || interval < 1 || interval > 2147483647)
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	context.wizard.state.endpoint.interval = interval;
	context.wizard.state.canSave = true;
	
	await context.replyWithHTML(`<b>Enter when endpoint expires in</b> \nInput: <i>amount</i> <i>unit</i> \nAvailable units: second, minute, hour, day, week, month, quarter, year \ne.g 60 days, 2 weeks, 1 year \n\n📌 you can type <i>never</i> or click just /${COMMAND_NAME_SAVE} and it won't expire`);
	return context.wizard.next();
}