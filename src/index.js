require('dotenv').config()

const log = require("./lib/log.js")
const bot = require("./lib/telegram/index.js")

bot.launch()

log.info("Telegram Bot was started")