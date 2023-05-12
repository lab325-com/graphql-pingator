import TelegramBot from '@classes/TelegramBot';
import { isValidJsonString } from '@lib/validator';

export default async context => {
	const paramName = 'data/options';
	
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context);
	
	const data = context.message.text.replaceAll('\n', '');
	
	if (!isValidJsonString(data))
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	context.wizard.state.endpoint.data = data;
	
	await context.replyWithHTML(`<b>Enter interval in seconds</b>`);
	return context.wizard.next();
}