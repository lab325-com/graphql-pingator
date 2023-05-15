import TelegramBot from '@classes/TelegramBot';
import { isValidJsonString } from '@lib/validator';
import { PARAM_NAME_DATA } from '@constants/Params';

export default async context => {
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context);
	
	const data = context.message.text.replaceAll('\n', '');
	
	if (!isValidJsonString(data))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_DATA);
	
	context.wizard.state.endpoint.data = data;
	
	await context.replyWithHTML(`<b>Enter interval in seconds</b>`);
	return context.wizard.next();
}