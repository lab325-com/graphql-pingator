const { Scenes, Markup} = require("telegraf");
const models = require("../../../../models");
const {fmt, bold} = require("telegraf/format");

const endpointsPerPage = 5

const prevPageButton = 'prevPage'
const nextPageButton = 'nextPage'
const pageButton = 'page'

async function getInlineEndpointsKeyboard(chatId, page) {
    if (!page)
        page = 0;

    const { count, rows } = await models.Endpoint.findAndCountAll({
        where: {
            chatId: chatId
        },
        limit: endpointsPerPage,
        offset: page
    })

    const buttons = []
    for (const endpoint of rows) {
        const button = `${endpoint.name} (${endpoint.type})`
        buttons.push([Markup.button.callback(button, endpoint.id)])
    }

    buttons.push([
        Markup.button.callback(`⬅️`, prevPageButton),
        Markup.button.callback(`page ${page + 1}/${Math.ceil(count / endpointsPerPage)}`, pageButton),
        Markup.button.callback(`➡️`, nextPageButton),
    ])

    const keyboard = Markup.inlineKeyboard(buttons)

    return { keyboard, rows, count }
}

const endpoints = new Scenes.BaseScene("endpoints")

endpoints.enter(async (ctx) => {
    const message = await ctx.replyWithHTML('Loading...')

    const timeout = setTimeout(async () => {
        await ctx.telegram.editMessageText(message.chat.id, message.message_id, null, 'Still loading...')
    }, 1000)

    const { keyboard, count } = await getInlineEndpointsKeyboard(ctx.message.chat.id.toString())

    clearTimeout(timeout)

    if (count === 0) {
        await ctx.telegram.editMessageText(message.chat.id, message.message_id, null,
            fmt`You have ${bold('0')} endpoints\n\n📌 To add new endpoint type /add`)
    }
    else {
        await ctx.telegram.editMessageText(message.chat.id, message.message_id, null,
            fmt`${bold(`List of Endpoints (${count})`)}`, keyboard.reply_markup)
        await ctx.replyWithHTML(`📌 To add new endpoint type /add \n📌 Toggle any endpoint to see its details and then edit or delete it`)
    }
})

endpoints.command('add', async (ctx) => {
    await ctx.scene.enter('add-endpoint')
})

module.exports = endpoints