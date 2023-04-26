const { Scenes, Markup} = require("telegraf");
const models = require("../../../../models");
const {fmt, bold} = require("telegraf/format");
const log = require("../../../log");
const { SCENE_NAME_ENDPOINTS, SCENE_NAME_ADD_ENDPOINT} = require("../../../../constants/Scene")

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
        offset: page * endpointsPerPage
    })

    const buttons = []
    for (const endpoint of rows) {
        const button = `${endpoint.name} (${endpoint.type})`
        buttons.push([Markup.button.callback(button, endpoint.id)])
    }

    const maxPage = Math.ceil(count / endpointsPerPage)

    buttons.push([
        Markup.button.callback(`⬅️`, prevPageButton),
        Markup.button.callback(`page ${page + 1}/${maxPage}`, pageButton),
        Markup.button.callback(`➡️`, nextPageButton),
    ])

    const keyboard = Markup.inlineKeyboard(buttons)

    return { keyboard, rows, count, maxPage }
}

const endpoints = new Scenes.BaseScene(SCENE_NAME_ENDPOINTS)

endpoints.enter(async (ctx) => {
    delete ctx.session.maxPage
    delete ctx.session.page

    const message = await ctx.replyWithHTML('Loading...')

    const timeout = setTimeout(async () => {
        await ctx.telegram.editMessageText(message.chat.id, message.message_id, null, 'Still loading...')
    }, 1000)

    const { keyboard, count, maxPage } = await getInlineEndpointsKeyboard(ctx.message.chat.id.toString())

    ctx.session.maxPage = maxPage

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

endpoints.on('callback_query', async (ctx) => {
    if (!ctx.session.page)
        ctx.session.page = 0

    if (ctx.callbackQuery.data === prevPageButton) {
        if (ctx.session.page > 0) {
            ctx.session.page = ctx.session.page - 1
            const { keyboard } = await getInlineEndpointsKeyboard(ctx.callbackQuery.message.chat.id.toString(), ctx.session.page)
            await ctx.editMessageReplyMarkup(keyboard.reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === nextPageButton) {
        if (ctx.session.page + 1 < ctx.session.maxPage) {
            ctx.session.page = ctx.session.page + 1
            const { keyboard } = await getInlineEndpointsKeyboard(ctx.callbackQuery.message.chat.id.toString(), ctx.session.page)
            await ctx.editMessageReplyMarkup(keyboard.reply_markup)
        }

        return await ctx.answerCbQuery()
    }
    else if (ctx.callbackQuery.data === pageButton) {
        return await ctx.answerCbQuery()
    }

    log.info(`Selected endpoint id: ${ctx.callbackQuery.data}`)

    /*const subjectId = String(ctx.callbackQuery.data)

    if (ctx.session.selectedSubject && ctx.session.selectedSubject._id.toString() === subjectId)
        return await ctx.answerCbQuery()

    const subject = await Subject.findOne({ _id: subjectId })

    let subjectRepresentation = `📓 Выбранный урок: <b>${subject.name}</b>\n\n`
    for (const link of subject.links) {
        subjectRepresentation += `${link.name}: ${link.url}\n`
    }

    saveToSession(ctx, "selectedSubject", subject)

    await ctx.editMessageText(subjectRepresentation, {
        reply_markup: getInlineSubjectsKeyboard(ctx.session.subjects, ctx.session.subjectsPage).reply_markup,
        parse_mode: "html"
    })
    await ctx.replyWithHTML(`✅ Выбран урок <b>${subject.name}</b>`, getSubjectsManageKeyboard(ctx, ctx.session.subjects))
    */await ctx.answerCbQuery()
})

module.exports = endpoints