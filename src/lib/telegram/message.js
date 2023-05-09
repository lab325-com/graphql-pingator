const isMessageNullOrEmpty = context => Boolean(context.message?.text?.trim() === '');

const sendValidationFailedMessage = async (context, paramName) =>
	await context.replyWithHTML(`🚫 <b>Invalid ${paramName} was sent.</b> Enter ${paramName} again!`);

const sendLoadingMessage = async context => await context.replyWithHTML('Loading...');

export { isMessageNullOrEmpty, sendValidationFailedMessage, sendLoadingMessage };
export default { isMessageNullOrEmpty, sendValidationFailedMessage, sendLoadingMessage };