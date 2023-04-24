const {Scenes} = require("telegraf");
const log = require("../../../log");
const {ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL} = require("../../../../constants/Endpoint");
const {isValidHttpUrl} = require("../../../validator");
const {HTTP_METHOD_GET, HTTP_METHOD_POST} = require("../../../../constants/Http");
const addEndpoint = new Scenes.WizardScene('add-endpoint',
async (ctx) => {
    ctx.wizard.state.endpoint = {}

    await ctx.replyWithHTML(`<b>Enter name of your endpoint</b> \n\n📌 if you don't want to add new endpoint you can type /cancel`)
    return ctx.wizard.next()
},
async (ctx) => {
    if (ctx.message.text === undefined || ctx.message.text === null || ctx.message.text.trim() === '') {
        await ctx.replyWithHTML(`🚫 <b>Invalid name was sent.</b> Enter name again!`)
        return
    }

    ctx.wizard.state.endpoint.chatId = ctx.message.chat.id.toString()
    ctx.wizard.state.endpoint.name = ctx.message.text.trim()

    await ctx.replyWithHTML(`<b>Enter type of endpoint.</b> Available types: \n- ${ENDPOINT_TYPE_REST}; \n- ${ENDPOINT_TYPE_GRAPHQL}`)
    // return await ctx.scene.enter('endpoints')
    return ctx.wizard.next()
},
async (ctx) => {
    if (ctx.message.text === undefined || ctx.message.text === null || ctx.message.text.trim() === '') {
        await ctx.replyWithHTML(`🚫 <b>Invalid type was sent.</b> Enter type again!`)
        return
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
    if (ctx.message.text === undefined || ctx.message.text === null || ctx.message.text.trim() === '') {
        await ctx.replyWithHTML(`🚫 <b>Invalid url was sent.</b> Enter url again!`)
        return
    }

    const url = ctx.message.text

    if (!isValidHttpUrl(url)) {
        await ctx.replyWithHTML(`🚫 <b>Invalid url was sent.</b> Enter url again!`)
        return
    }

    ctx.wizard.state.endpoint.url = url

    if (ctx.wizard.state.endpoint.type === ENDPOINT_TYPE_GRAPHQL) {
        await ctx.replyWithHTML(`<b>Enter data/options that will be sent in request</b> e.g. <pre language="json">{ 'headers': { 'Authorization': 'token' }, 'body': { ... } }</pre>`)
        return ctx.wizard.selectStep(ctx.wizard.cursor + 2)
    }

    await ctx.replyWithHTML(`<b>Enter HTTP Method.</b> Available methods: \n- ${HTTP_METHOD_GET}; \n- ${HTTP_METHOD_POST}`)
    return ctx.wizard.next()
})

addEndpoint.command('cancel', async (ctx) => {
    ctx.wizard.state = {}
    await ctx.scene.enter('endpoints')
})

module.exports = addEndpoint