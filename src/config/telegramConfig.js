require('dotenv').config()

const {
    DEV_TELEGRAM_BOT_API_TOKEN
} = process.env;

module.exports = {
    local: {
        token: DEV_TELEGRAM_BOT_API_TOKEN
    },
    development: {
        token: DEV_TELEGRAM_BOT_API_TOKEN
    },
    production: {
        token: DEV_TELEGRAM_BOT_API_TOKEN
    }
};