import TelegramBot from '@classes/TelegramBot';
import { DateTime } from 'luxon';
import { createEndpoint } from '@lib/telegram/scenes/endpoints/add';
import { PARAM_NAME_EXPIRATION } from '@constants/Params';

export default async context => {
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_EXPIRATION);
	
	if (context.message.text.toLowerCase() === 'never')
		return await createEndpoint(context);
	
	const literals = context.message.text.split(' ');
	
	if (literals.length !== 2)
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_EXPIRATION);
	
	try {
		const amount = parseInt(literals[0]);
		const unit = literals[1];
		
		if (isNaN(amount) || amount < 1)
			return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_EXPIRATION);
		
		context.wizard.state.endpoint.expireAt = DateTime.now()
			.plus({ [unit]: amount })
			.toJSDate();
	} catch (e) {
		return await TelegramBot.sendValidationFailedMessage(context, PARAM_NAME_EXPIRATION);
	}
	
	
	await createEndpoint(context);
}