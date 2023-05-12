import TelegramBot from '@classes/TelegramBot';

export default async context => {
	const paramName = 'success status code';
	
	if (TelegramBot.isMessageNullOrEmpty(context))
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	const restSuccessStatus = parseInt(context.message.text);
	if (isNaN(restSuccessStatus) || restSuccessStatus < 100 || restSuccessStatus > 599)
		return await TelegramBot.sendValidationFailedMessage(context, paramName);
	
	context.wizard.state.endpoint.restSuccessStatus = restSuccessStatus;
	
	await context.replyWithHTML(`<b>Enter data/options JSON that will be sent in request. Be sure to use "" instead of others</b>\ne.g. { "headers": { "Authorization": "token" }, "data": { "query": { "..." } } }`);
	return context.wizard.next();
}