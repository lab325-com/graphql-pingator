import TelegramBot from '@classes/TelegramBot';
import { isValidHttpUrl } from '@lib/validator';
import { ENDPOINT_TYPE_GRAPHQL } from '@constants/Endpoint';
import { HTTP_METHOD_GET, HTTP_METHOD_POST } from '@constants/Http';
import { PARAM_NAME_URL } from '@constants/Params';

export default async context => {
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_URL);
	
	const url = context.message.text;
	
	if (!isValidHttpUrl(url))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_URL);
	
	context.wizard.state.endpoint.url = url;
	
	if (context.wizard.state.endpoint.type === ENDPOINT_TYPE_GRAPHQL) {
		await context.replyWithHTML(`<b>Enter data/options that will be sent in request.</b>\ne.g. { "headers": { "Authorization": "token" }, "body": { ... } }`);
		return context.wizard.selectStep(context.wizard.cursor + 3);
	}
	
	await context.replyWithHTML(`<b>Enter HTTP Method.</b> Available methods: \n✔️ ${HTTP_METHOD_GET}; \n✔️ ${HTTP_METHOD_POST}`);
	return context.wizard.next();
}