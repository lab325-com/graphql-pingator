const { Markup } = require('telegraf')

const settingsButton = "⚙️ Settings"

const startButton = "🟢 Start"
const stopButton = "🔴 Stop"

const mainWithStartKeyboard = Markup.keyboard([startButton, settingsButton]).resize()
const mainWithStopKeyboard = Markup.keyboard([stopButton, settingsButton]).resize()

const backButton = "↩️ Go back"
const backKeyboard = Markup.keyboard([backButton]).resize()

module.exports = {
    backButton, backKeyboard,
    settingsButton, startButton, stopButton, mainWithStartKeyboard, mainWithStopKeyboard,
}