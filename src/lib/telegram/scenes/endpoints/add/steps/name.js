import TelegramBot from '@classes/TelegramBot';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import { PARAM_NAME_NAME } from '@constants/Params';

export default async context => {
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_NAME);
	
	context.wizard.state.endpoint.chatId = context.message.chat.id.toString();
	context.wizard.state.endpoint.name = context.message.text.trim();
	
	await context.replyWithHTML(`<b>Enter type of endpoint.</b> Available types: \n✔️ ${ENDPOINT_TYPE_REST}; \n✔️ ${ENDPOINT_TYPE_GRAPHQL}`);
	return context.wizard.next();
}