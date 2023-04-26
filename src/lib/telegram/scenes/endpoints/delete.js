const {Scenes} = require("telegraf");
const {SCENE_NAME_DELETE_ENDPOINT, SCENE_NAME_ENDPOINTS} = require("../../../../constants/Scene");
const models = require("../../../../models");

const deleteEndpoint = new Scenes.BaseScene(SCENE_NAME_DELETE_ENDPOINT)

deleteEndpoint.enter(async (ctx) => {
    if (ctx.scene.state.endpointId === undefined || ctx.scene.state.endpointId === null)
        return ctx.scene.leave()

    await ctx.replyWithHTML(`⚠️ Are you sure you want to delete this endpoint? \n/yes or /no`)
})

deleteEndpoint.command('yes', async (ctx) => {
    const endpointId = ctx.scene.state.endpointId

    await models.Endpoint.destroy({ where: { id: endpointId, chatId: ctx.message.chat.id.toString() } })
    
    return ctx.scene.enter(SCENE_NAME_ENDPOINTS)
})

deleteEndpoint.command('no', async (ctx) => {
    return ctx.scene.enter(SCENE_NAME_ENDPOINTS)
})

module.exports = deleteEndpoint