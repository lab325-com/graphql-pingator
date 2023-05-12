import TelegramBot from '@classes/TelegramBot';
import { DateTime } from 'luxon';
import { saveEndpoint } from '@lib/telegram/scenes/endpoints/edit';

export default async context => {
	const paramName = 'expiration';
	
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	if (context.message.text.toLowerCase() === 'never') {
		context.wizard.state.endpoint.expireAt = null;
		return await saveEndpoint(context);
	}
	
	const literals = context.message.text.split(' ');
	
	if (literals.length !== 2)
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	try {
		const amount = parseInt(literals[0]);
		const unit = literals[1];
		
		if (isNaN(amount) || amount < 1)
			return await TelegramBot.sendValidationFailedMessage(context, paramName);
		
		context.wizard.state.endpoint.expireAt = DateTime.now()
			.plus({ [unit]: amount })
			.toJSDate();
	} catch (e) {
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	}
	
	await saveEndpoint(context);
}