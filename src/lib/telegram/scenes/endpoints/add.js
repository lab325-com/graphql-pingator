const {Scenes} = require("telegraf");
const log = require("../../../log");
const {ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL} = require("../../../../constants/Endpoint");
const {isValidHttpUrl, isValidJsonString} = require("../../../validator");
const {HTTP_METHOD_GET, HTTP_METHOD_POST} = require("../../../../constants/Http");
const models = require("../../../../models");

function isMessageNullOrEmpty(ctx) {
    return ctx.message === undefined || ctx.message === null
        || ctx.message.text === undefined || ctx.message.text === null
        || ctx.message.text.trim() === ''
}

async function sendValidationFailedMessage(ctx, paramName) {
    await ctx.replyWithHTML(`🚫 <b>Invalid ${paramName} was sent.</b> Enter ${paramName} again!`)
}

const addEndpoint = new Scenes.WizardScene('add-endpoint',
async (ctx) => {
    ctx.wizard.state.endpoint = {}
    ctx.wizard.state.canSave = false

    await ctx.replyWithHTML(`<b>Enter name of your endpoint</b> \n\n📌 if you don't want to add new endpoint you can type /cancel`)
    return ctx.wizard.next()
},
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'name')
    }

    ctx.wizard.state.endpoint.chatId = ctx.message.chat.id.toString()
    ctx.wizard.state.endpoint.name = ctx.message.text.trim()

    await ctx.replyWithHTML(`<b>Enter type of endpoint.</b> Available types: \n- ${ENDPOINT_TYPE_REST}; \n- ${ENDPOINT_TYPE_GRAPHQL}`)
    // return await ctx.scene.enter('endpoints')
    return ctx.wizard.next()
},
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'type')
    }

    const type = ctx.message.text.toLowerCase()
    if (type !== ENDPOINT_TYPE_REST && type !== ENDPOINT_TYPE_GRAPHQL) {
        await ctx.replyWithHTML(`🚫 <b>Invalid type was sent.</b> Enter type again!`)
        return
    }

    ctx.wizard.state.endpoint.type = type

    await ctx.replyWithHTML(`<b>Enter url of endpoint</b>`)
    return ctx.wizard.next()
},
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'url')
    }

    const url = ctx.message.text

    if (!isValidHttpUrl(url)) {
        return await sendValidationFailedMessage(ctx, 'url')
    }

    ctx.wizard.state.endpoint.url = url

    if (ctx.wizard.state.endpoint.type === ENDPOINT_TYPE_GRAPHQL) {
        await ctx.replyWithHTML(`<b>Enter data/options that will be sent in request.</b>\ne.g. <pre language="json">{ 'headers': { 'Authorization': 'token' }, 'body': { ... } }</pre>`)
        return ctx.wizard.selectStep(ctx.wizard.cursor + 3)
    }

    await ctx.replyWithHTML(`<b>Enter HTTP Method.</b> Available methods: \n- ${HTTP_METHOD_GET}; \n- ${HTTP_METHOD_POST}`)
    return ctx.wizard.next()
},
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'HTTP Method')
    }

    const httpMethod = ctx.message.text.toUpperCase()
    if (httpMethod !== HTTP_METHOD_GET && httpMethod !== HTTP_METHOD_POST) {
        return await sendValidationFailedMessage(ctx, 'HTTP Method')
    }

    ctx.wizard.state.endpoint.httpMethod = httpMethod

    await ctx.replyWithHTML(`<b>Enter success status code of endpoint</b> \ne.g. <pre>200</pre>`)
    return ctx.wizard.next()
},
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'success status code')
    }

    const restSuccessStatus = parseInt(ctx.message.text)
    if (isNaN(restSuccessStatus) || restSuccessStatus < 100 || restSuccessStatus > 599) {
        return await sendValidationFailedMessage(ctx, 'success status code')
    }

    ctx.wizard.state.endpoint.restSuccessStatus = restSuccessStatus

    await ctx.replyWithHTML(`<b>Enter data/options JSON that will be sent in request.</b>\ne.g. <pre language="json">{ 'headers': { 'Authorization': 'token' }, 'body': { ... } }</pre>`)
    return ctx.wizard.next()
},
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'data/options')
    }
    
    const data = ctx.message.text.replaceAll('\n', '')
    if (!isValidJsonString(data)) {
        return await sendValidationFailedMessage(ctx, 'data/options')
    }
    
    ctx.wizard.state.endpoint.data = data

    await ctx.replyWithHTML(`<b>Enter interval in seconds</b>`)
    return ctx.wizard.next()
}, 
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'interval')
    }

    const interval = parseInt(ctx.message.text)
    if (isNaN(interval) || interval < 1) {
        return await sendValidationFailedMessage(ctx, 'interval')
    }

    ctx.wizard.state.endpoint.interval = interval
    ctx.wizard.state.canSave = true

    await ctx.replyWithHTML(`<b>Enter when endpoint expires in</b> \ne.g <pre>in 60 days</pre> \n\n📌 or click /save and it won't expire`)
    // TODO implement this field + auto save and
})

addEndpoint.command('cancel', async (ctx) => {
    delete ctx.wizard.state.endpoint
    await ctx.scene.enter('endpoints')
})

addEndpoint.command('save', async (ctx) => {
    if (ctx.wizard.state.canSave === true) {
        try {
            const endpoint = await models.Endpoint.create({ id: null, ...ctx.wizard.state.endpoint })

            await ctx.replyWithHTML(`✅ New endpoint was created!`)

            delete ctx.wizard.state.endpoint
            return await ctx.scene.enter('endpoints')
        }
        catch (e) {
            log.error(e)
            ctx.replyWithHTML(`⚠️ Error occurred while creating new endpoint, try click /save again!`)
        }
    }
})

module.exports = addEndpoint