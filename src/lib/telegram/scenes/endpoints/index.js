const { Scenes, Markup} = require("telegraf");
const models = require("../../../../models");
const {fmt, bold} = require("telegraf/format");
const { SCENE_NAME_ENDPOINTS, SCENE_NAME_ADD_ENDPOINT, SCENE_NAME_DELETE_ENDPOINT} = require("../../../../constants/Scene")
const {getHumanReadableDateDifference} = require("../../../date");
const {ENDPOINT_TYPE_REST} = require("../../../../constants/Endpoint");

const endpointsPerPage = 5

const prevPageButton = 'prevPage'
const nextPageButton = 'nextPage'
const pageButton = 'page'

const callbackDataSeparator = '__'

function callbackData(id, data) {
    return id + callbackDataSeparator + data
}

async function getInlineEndpointsKeyboard(chatId, sceneEnteredAt, page) {
    if (!page)
        page = 0;

    const { count, rows } = await models.Endpoint.findAndCountAll({
        attributes: ['id', 'name', 'type'],
        where: {
            chatId: chatId
        },
        limit: endpointsPerPage,
        offset: page * endpointsPerPage
    })

    const buttons = []
    for (const endpoint of rows) {
        const button = `${endpoint.name} (${endpoint.type})`
        buttons.push([Markup.button.callback(button, callbackData(sceneEnteredAt, endpoint.id))])
    }

    const maxPage = Math.ceil(count / endpointsPerPage)

    buttons.push([
        Markup.button.callback(`⬅️`, callbackData(sceneEnteredAt, prevPageButton)),
        Markup.button.callback(`page ${page + 1}/${maxPage}`, pageButton),
        Markup.button.callback(`➡️`, callbackData(sceneEnteredAt, nextPageButton)),
    ])

    const keyboard = Markup.inlineKeyboard(buttons)

    return { keyboard, rows, count, maxPage }
}

const endpoints = new Scenes.BaseScene(SCENE_NAME_ENDPOINTS)

endpoints.enter(async (ctx) => {
    delete ctx.scene.state.maxPage
    delete ctx.scene.state.page

    ctx.scene.state.enteredAt = new Date().getTime().toString()

    const message = await ctx.replyWithHTML('Loading...')

    const timeout = setTimeout(async () => {
        await ctx.telegram.editMessageText(message.chat.id, message.message_id, null, 'Still loading...')
    }, 1000)

    const { keyboard, count, maxPage } = await getInlineEndpointsKeyboard(ctx.message.chat.id.toString(), ctx.scene.state.enteredAt)

    ctx.scene.state.maxPage = maxPage

    clearTimeout(timeout)

    if (count === 0) {
        await ctx.telegram.editMessageText(message.chat.id, message.message_id, null,
            fmt`You have ${bold('0')} endpoints\n\n📌 To add new endpoint click /add`)
    }
    else {
        await ctx.telegram.editMessageText(message.chat.id, message.message_id, null,
            fmt`${bold(`List of Endpoints (${count})`)}\n\n📌 To add new endpoint click /add \n📌 Toggle any endpoint to see its details and then edit or delete it`, keyboard)
    }
})

endpoints.command('add', async (ctx) => {
    await ctx.scene.enter(SCENE_NAME_ADD_ENDPOINT)
})

endpoints.command('delete', async (ctx) => {
    if (ctx.scene.state.selectedEndpoint === undefined || ctx.scene.state.selectedEndpoint === null)
        return

    await ctx.scene.enter(SCENE_NAME_DELETE_ENDPOINT, { endpointId: ctx.scene.state.selectedEndpoint.id} )
})

endpoints.on('callback_query', async (ctx) => {
    if (!ctx.scene.state.page)
        ctx.scene.state.page = 0

    if (ctx.callbackQuery.data === callbackData(ctx.scene.state.enteredAt, prevPageButton)) {
        if (ctx.scene.state.page > 0) {
            ctx.scene.state.page = ctx.scene.state.page - 1
            const { keyboard } = await getInlineEndpointsKeyboard(ctx.callbackQuery.message.chat.id.toString(), ctx.scene.state.enteredAt, ctx.scene.state.page)
            await ctx.editMessageReplyMarkup(keyboard.reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === callbackData(ctx.scene.state.enteredAt, nextPageButton)) {
        if (ctx.scene.state.page + 1 < ctx.scene.state.maxPage) {
            ctx.scene.state.page = ctx.scene.state.page + 1
            const { keyboard } = await getInlineEndpointsKeyboard(ctx.callbackQuery.message.chat.id.toString(), ctx.scene.state.enteredAt, ctx.scene.state.page)
            await ctx.editMessageReplyMarkup(keyboard.reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === pageButton) {
        return await ctx.answerCbQuery()
    }

    const literals = String(ctx.callbackQuery.data).split('__')
    const sceneEnteredAt = literals[0]

    if (sceneEnteredAt !== String(ctx.scene.state.enteredAt))
        return await ctx.answerCbQuery()

    const endpointId = literals[1]

    if (ctx.scene.state.selectedEndpoint && ctx.scene.state.selectedEndpoint.id === endpointId)
        return await ctx.answerCbQuery()

    const endpoint = await models.Endpoint.findByPk(endpointId, { where: { chatId: ctx.callbackQuery.message.chat.id.toString() }})

    ctx.scene.state.selectedEndpoint = endpoint

    if (ctx.scene.state.selectedEndpointMessageId !== undefined) {
        await ctx.telegram.deleteMessage(ctx.callbackQuery.message.chat.id, ctx.scene.state.selectedEndpointMessageId)
    }

    let endpointsRepresentation = `✅ Selected endpoint <b>${endpoint.name}</b>\n`
    endpointsRepresentation += `url: ${endpoint.url}\n`
    endpointsRepresentation += `type: ${endpoint.type}\n`
    endpointsRepresentation += `data: ${endpoint.data}\n`

    if (endpoint.type === ENDPOINT_TYPE_REST) {
        endpointsRepresentation += `http method: ${endpoint.httpMethod}\n`
        endpointsRepresentation += `rest success status: ${endpoint.restSuccessStatus}\n`
    }

    endpointsRepresentation += `expires in: ${getHumanReadableDateDifference(new Date(), endpoint.expireAt)}`
    endpointsRepresentation += `\n\n📌 Click /delete or /edit`

    const message = await ctx.replyWithHTML(endpointsRepresentation)

    ctx.scene.state.selectedEndpointMessageId = message.message_id

    await ctx.answerCbQuery()
})

module.exports = endpoints