export const isMessageNullOrEmpty = context => Boolean(context.message?.text?.trim() === '');

export const sendValidationFailedMessage = async (context, paramName) =>
	await context.replyWithHTML(`🚫 <b>Invalid ${paramName} was sent.</b> Enter ${paramName} again!`);

export const sendLoadingMessage = async (context) => {
	const message = await context.replyWithHTML('Loading...');
	
	const timeout = setTimeout(async () => {
		await context.telegram.editMessageText(message.chat.id, message.message_id, null, 'Still loading...');
	}, 1000);
	
	const cancelLoading = () => clearTimeout(timeout);
	
	return { cancelLoading, message };
};