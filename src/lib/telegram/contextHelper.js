const isMessageNullOrEmpty = context => Boolean(context.message?.text?.trim() === '');

const sendValidationFailedMessage = async (context, paramName) =>
	await context.replyWithHTML(`🚫 <b>Invalid ${paramName} was sent.</b> Enter ${paramName} again!`);

// module.exports = { isMessageNullOrEmpty, sendValidationFailedMessage };
export default { isMessageNullOrEmpty, sendValidationFailedMessage };