import TelegramBot from '@classes/TelegramBot';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';

export default async context => {
	const paramName = 'type';
	
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	const type = context.message.text.toLowerCase();
	
	if (type !== ENDPOINT_TYPE_REST && type !== ENDPOINT_TYPE_GRAPHQL)
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	context.wizard.state.endpoint.type = type;
	
	await context.replyWithHTML(`<b>Enter url of endpoint</b>`);
	return context.wizard.next();
}