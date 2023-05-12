import TelegramBot from '@classes/TelegramBot';
import { HTTP_METHOD_GET, HTTP_METHOD_POST } from '@constants/Http';

export default async context => {
	const paramName = 'HTTP Method';
	
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	const httpMethod = context.message.text.toUpperCase();
	
	if (httpMethod !== HTTP_METHOD_GET && httpMethod !== HTTP_METHOD_POST)
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	context.wizard.state.endpoint.httpMethod = httpMethod;
	
	await context.replyWithHTML(`<b>Enter success status code of endpoint</b> \ne.g. 200`);
	return context.wizard.next();
}