require('dotenv').config()

const log = require("./lib/log")
const bot = require("./lib/telegram/index")

bot.launch()

log.info("🚀 Telegram Bot was started")