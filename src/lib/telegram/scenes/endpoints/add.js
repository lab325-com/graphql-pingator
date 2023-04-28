const { Scenes } = require('telegraf');
const log = require('../../../log');
const { ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL } = require('../../../../constants/Endpoint');
const { isValidHttpUrl, isValidJsonString } = require('../../../validator');
const { HTTP_METHOD_GET, HTTP_METHOD_POST } = require('../../../../constants/Http');
const models = require('../../../../models');
const { SCENE_NAME_ADD_ENDPOINT, SCENE_NAME_ENDPOINTS } = require('../../../../constants/Scene');
const { addToDate } = require('../../../date');
const { sendValidationFailedMessage, isMessageNullOrEmpty } = require('../../contextHelper');

const addEndpoint = new Scenes.WizardScene(SCENE_NAME_ADD_ENDPOINT,
async (context) => {
    context.wizard.state.endpoint = {}
    context.wizard.state.canSave = false

    await context.replyWithHTML(`<b>Enter name of your endpoint</b> \n\n📌 if you don't want to add new endpoint you can type /cancel`)
    return context.wizard.next()
},
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'name')
    }

    context.wizard.state.endpoint.chatId = context.message.chat.id.toString()
    context.wizard.state.endpoint.name = context.message.text.trim()

    await context.replyWithHTML(`<b>Enter type of endpoint.</b> Available types: \n✔️ ${ENDPOINT_TYPE_REST}; \n✔️ ${ENDPOINT_TYPE_GRAPHQL}`)
    return context.wizard.next()
},
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'type')
    }

    const type = context.message.text.toLowerCase()
    if (type !== ENDPOINT_TYPE_REST && type !== ENDPOINT_TYPE_GRAPHQL) {
        return await sendValidationFailedMessage(context, 'type')
    }

    context.wizard.state.endpoint.type = type

    await context.replyWithHTML(`<b>Enter url of endpoint</b>`)
    return context.wizard.next()
},
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'url')
    }

    const url = context.message.text

    if (!isValidHttpUrl(url)) {
        return await sendValidationFailedMessage(context, 'url')
    }

    context.wizard.state.endpoint.url = url

    if (context.wizard.state.endpoint.type === ENDPOINT_TYPE_GRAPHQL) {
        await context.replyWithHTML(`<b>Enter data/options that will be sent in request.</b>\ne.g. { "headers": { "Authorization": "token" }, "body": { ... } }`)
        return context.wizard.selectStep(context.wizard.cursor + 3)
    }

    await context.replyWithHTML(`<b>Enter HTTP Method.</b> Available methods: \n✔️ ${HTTP_METHOD_GET}; \n✔️ ${HTTP_METHOD_POST}`)
    return context.wizard.next()
},
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'HTTP Method')
    }

    const httpMethod = context.message.text.toUpperCase()
    if (httpMethod !== HTTP_METHOD_GET && httpMethod !== HTTP_METHOD_POST) {
        return await sendValidationFailedMessage(context, 'HTTP Method')
    }

    context.wizard.state.endpoint.httpMethod = httpMethod

    await context.replyWithHTML(`<b>Enter success status code of endpoint</b> \ne.g. 200`)
    return context.wizard.next()
},
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'success status code')
    }

    const restSuccessStatus = parseInt(context.message.text)
    if (isNaN(restSuccessStatus) || restSuccessStatus < 100 || restSuccessStatus > 599) {
        return await sendValidationFailedMessage(context, 'success status code')
    }

    context.wizard.state.endpoint.restSuccessStatus = restSuccessStatus

    await context.replyWithHTML(`<b>Enter data/options JSON that will be sent in request.</b>\ne.g. { "headers": { "Authorization": "token" }, "body": { ... } }`)
    return context.wizard.next()
},
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'data/options')
    }
    
    const data = context.message.text.replaceAll('\n', '')
    if (!isValidJsonString(data)) {
        return await sendValidationFailedMessage(context, 'data/options')
    }
    
    context.wizard.state.endpoint.data = data

    await context.replyWithHTML(`<b>Enter interval in seconds</b>`)
    return context.wizard.next()
}, 
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'interval')
    }

    const interval = parseInt(context.message.text)
    if (isNaN(interval) || interval < 1 || interval > 2147483647) {
        return await sendValidationFailedMessage(context, 'interval')
    }

    context.wizard.state.endpoint.interval = interval
    context.wizard.state.canSave = true

    await context.replyWithHTML(`<b>Enter when endpoint expires in</b> \nInput: <i>amount</i> <i>unit</i> \nAvailable units: second, minute, hour, day, week, month, quarter, year \ne.g 60 days, 2 weeks, 1 year \n\n📌 you can type <i>never</i> or click just /save and it won't expire`)
    return context.wizard.next()
},
async (context) => {
    if (isMessageNullOrEmpty(context)) {
        return await sendValidationFailedMessage(context, 'expiration')
    }

    if (context.message.text.toLowerCase() === 'never') {
        return await createEndpoint(context)
    }

    const literals = context.message.text.split(' ')

    if (literals.length !== 2) {
        return await sendValidationFailedMessage(context, 'expiration')
    }

    try {
        const amount = parseInt(literals[0])
        const unit = literals[1]

        if (isNaN(amount) || amount < 1)
            return await sendValidationFailedMessage(context, 'expiration')

        context.wizard.state.endpoint.expireAt = addToDate(new Date(), amount, unit)
    } catch (e) {
        return await sendValidationFailedMessage(context, 'expiration')
    }

    await createEndpoint(context)
})

addEndpoint.command('cancel', async (context) => {
    delete context.wizard.state.endpoint
    await context.scene.enter(SCENE_NAME_ENDPOINTS)
})

addEndpoint.command('save', async (context) => {
    if (context.wizard.state.canSave === true) {
        await createEndpoint(context)
    }
})

async function createEndpoint(context) {
    try {
        await models.Endpoint.create(context.wizard.state.endpoint)

        await context.replyWithHTML(`✅ New endpoint was created!`)

        delete context.wizard.state.endpoint
        return await context.scene.enter(SCENE_NAME_ENDPOINTS)
    } catch (e) {
        log.error(e)
        await context.replyWithHTML(`⚠️ Error occurred while creating new endpoint, try click /save again!`)
    }
}

module.exports = addEndpoint