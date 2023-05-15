import TelegramBot from '@classes/TelegramBot';
import { HTTP_METHOD_GET, HTTP_METHOD_POST } from '@constants/Http';
import { PARAM_NAME_HTTP_METHOD } from '@constants/Params';

export default async context => {
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_HTTP_METHOD);
	
	const httpMethod = context.message.text.toUpperCase();
	
	if (httpMethod !== HTTP_METHOD_GET && httpMethod !== HTTP_METHOD_POST)
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_HTTP_METHOD);
	
	context.wizard.state.endpoint.httpMethod = httpMethod;
	
	await context.replyWithHTML(`<b>Enter success status code of endpoint</b> \ne.g. 200`);
	return context.wizard.next();
}