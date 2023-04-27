function isMessageNullOrEmpty(ctx) {
    return ctx.message === undefined || ctx.message === null
        || ctx.message.text === undefined || ctx.message.text === null
        || ctx.message.text.trim() === ''
}

async function sendValidationFailedMessage(ctx, paramName) {
    await ctx.replyWithHTML(`🚫 <b>Invalid ${paramName} was sent.</b> Enter ${paramName} again!`)
}

module.exports = { isMessageNullOrEmpty, sendValidationFailedMessage }