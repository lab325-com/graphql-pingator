const {Scenes} = require("telegraf");
const {SCENE_NAME_EDIT_ENDPOINT, SCENE_NAME_ENDPOINTS} = require("../../../../constants/Scene");
const {isMessageNullOrEmpty, sendValidationFailedMessage} = require("../../contextHelper");
const {addToDate} = require("../../../date");
const models = require("../../../../models");
const log = require("../../../log");

const editEndpoint = new Scenes.WizardScene(SCENE_NAME_EDIT_ENDPOINT,
async (ctx) => {
    ctx.wizard.state.endpoint = {}

    await ctx.replyWithHTML(`<b>Enter when endpoint expires in</b> \nInput: <i>amount</i> <i>unit</i> \nAvailable units: second, minute, hour, day, week, month, quarter, year \ne.g 60 days, 2 weeks, 1 year \n\n📌 you can type <i>never</i> and it won't expire \n📌 if you don't want to edit click /cancel`)
    return ctx.wizard.next()
},
async (ctx) => {
    if (isMessageNullOrEmpty(ctx)) {
        return await sendValidationFailedMessage(ctx, 'expiration')
    }

    if (ctx.message.text.toLowerCase() === 'never') {
        ctx.wizard.state.endpoint.expireAt = null
        return await saveEndpoint(ctx)
    }

    const literals = ctx.message.text.split(' ')

    if (literals.length !== 2) {
        return await sendValidationFailedMessage(ctx, 'expiration')
    }

    try {
        const amount = parseInt(literals[0])
        const unit = literals[1]

        if (isNaN(amount) || amount < 1)
            return await sendValidationFailedMessage(ctx, 'expiration')

        ctx.wizard.state.endpoint.expireAt = addToDate(new Date(), amount, unit)
    }
    catch (e) {
        return await sendValidationFailedMessage(ctx, 'expiration')
    }

    await saveEndpoint(ctx)
})

editEndpoint.command('cancel', async (ctx) => {
    delete ctx.wizard.state.endpoint
    await ctx.scene.enter(SCENE_NAME_ENDPOINTS)
})

async function saveEndpoint(ctx) {
    try {
        await models.Endpoint.update(ctx.wizard.state.endpoint, { where: { id: ctx.wizard.state.endpointId }})

        await ctx.replyWithHTML(`✅ Endpoint was saved!`)

        delete ctx.wizard.state.endpoint
        return await ctx.scene.enter(SCENE_NAME_ENDPOINTS)
    }
    catch (e) {
        log.error(e)
        await ctx.replyWithHTML(`⚠️ Error occurred while saving endpoint, try click /save again!`)
    }
}

module.exports = editEndpoint