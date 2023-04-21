const { Scenes, Markup} = require("telegraf");
const {backButton, intervalButton, showOkResultTrueButton, showOkResultFalseButton, showElapsedTimeFalseButton,
    showElapsedTimeTrueButton, } = require("../../keyboard");
const models = require("../../../../models");

const editIntervalCallback = 'show interval'
const toggleShowOkResultCallback = 'toggle show ok result'
const toggleShowElapsedTimeCallback = 'toggle show elapsed time'

const getSettingsKeyboard = (intervalInSeconds, showOkResult, showElapsedTime) => {
    const settingsIntervalButton = intervalButton + ` (${intervalInSeconds}}s)`
    const settingsShowOkResultButton = showOkResult ? showOkResultTrueButton : showOkResultFalseButton
    const settingsShowElapsedTimeButton = showElapsedTime ? showElapsedTimeTrueButton : showElapsedTimeFalseButton
    const settingsKeyboard = Markup.inlineKeyboard([
        Markup.button.callback(settingsIntervalButton, editIntervalCallback),
        Markup.button.callback(settingsShowOkResultButton, editIntervalCallback),
        Markup.button.callback(settingsShowElapsedTimeButton, editIntervalCallback),
        Markup.button.callback(backButton, editIntervalCallback)])

    return { settingsKeyboard, settingsIntervalButton, settingsShowOkResultButton, settingsShowElapsedTimeButton, backButton}
}

const options = new Scenes.BaseScene("options")

options.hears(backButton, async (ctx) => await ctx.scene.leave());

options.enter(async (ctx) => {
    const message = await ctx.replyWithHTML("Loading...")

    const job = await models.Job.findOne({ where: { id: ctx.message.chat.id } })

    await ctx.telegram.deleteMessage(message.chat.id, message.message_id)

    if (job === null || job === undefined)
        return await ctx.scene.leave()

    const { settingsKeyboard } = getSettingsKeyboard(job.interval, job.showOkResult, job.showElapsedTime)

    await ctx.replyWithHTML("<b>⚙️ Settings</b>\n\n📌 Toggle any option you want to edit", settingsKeyboard)
})

module.exports = options