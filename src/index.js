import * as dotenv from 'dotenv'
dotenv.config()

import log from "./lib/log.js";
import bot from "./lib/telegram/index.js"

bot.launch()

log.info("Telegram Bot was started")