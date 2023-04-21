const { Markup } = require('telegraf')

const settingsButton = "⚙️ Settings"

const startButton = "🟢 Start"
const stopButton = "🔴 Stop"

const mainWithStartKeyboard = Markup.keyboard([startButton, settingsButton]).resize()
const mainWithStopKeyboard = Markup.keyboard([stopButton, settingsButton]).resize()

const backButton = "↩️ Go back"

const intervalButton = "🕒 Interval"
const showOkResultTrueButton = "Show successful result ✅"
const showOkResultFalseButton = "Show successful result ❌"
const showElapsedTimeTrueButton = "Show elapsed time ✅"
const showElapsedTimeFalseButton = "Show elapsed time ❌"

module.exports = {
    backButton,
    settingsButton, startButton, stopButton, mainWithStartKeyboard, mainWithStopKeyboard,
    intervalButton, showOkResultTrueButton, showOkResultFalseButton, showElapsedTimeFalseButton, showElapsedTimeTrueButton
}