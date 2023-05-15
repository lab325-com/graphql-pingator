import TelegramBot from '@classes/TelegramBot';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import { PARAM_NAME_TYPE } from '@constants/Params';

export default async context => {
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_TYPE);
	
	const type = context.message.text.toLowerCase();
	
	if (type !== ENDPOINT_TYPE_REST && type !== ENDPOINT_TYPE_GRAPHQL)
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_TYPE);
	
	context.wizard.state.endpoint.type = type;
	
	await context.replyWithHTML(`<b>Enter url of endpoint</b>`);
	return context.wizard.next();
}