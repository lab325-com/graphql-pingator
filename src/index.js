require('dotenv').config()
const bot = require("./lib/telegram/index")
const log = require('./lib/log')

bot.launch()

log.info("🚀 Telegram Bot was started")