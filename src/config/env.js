require('dotenv').config()

let {
    CONSOLE_LOGGING_LEVELS = `custom,info,error,warn,query`,
    DEV_TELEGRAM_BOT_API_TOKEN,
    DEV_POSTGRES_DB, DEV_POSTGRES_HOST, DEV_POSTGRES_PASSWORD, DEV_POSTGRES_USER
} = process.env

CONSOLE_LOGGING_LEVELS = CONSOLE_LOGGING_LEVELS.split(`,`);

module.exports = {
    CONSOLE_LOGGING_LEVELS,
    DEV_TELEGRAM_BOT_API_TOKEN,
    DEV_POSTGRES_DB, DEV_POSTGRES_HOST, DEV_POSTGRES_PASSWORD, DEV_POSTGRES_USER
}