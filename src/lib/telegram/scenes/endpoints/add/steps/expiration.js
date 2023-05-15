import TelegramBot from '@classes/TelegramBot';
import { createEndpoint } from '@lib/telegram/scenes/endpoints/add';
import { PARAM_NAME_EXPIRATION } from '@constants/Params';
import { addIntervalToNow } from '@lib/luxon';
import { ENDPOINT_NEVER_EXPIRES_VALUE } from '@constants/Endpoint';

export default async context => {
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_EXPIRATION);
	
	if (context.message.text.toLowerCase() === ENDPOINT_NEVER_EXPIRES_VALUE)
		return await createEndpoint(context);
	
	const expireAt = addIntervalToNow(context.message.text);
	
	if (!expireAt)
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_EXPIRATION);
	
	context.wizard.state.endpoint.expireAt = expireAt
	
	await createEndpoint(context);
}