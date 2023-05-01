import { config } from 'dotenv';
config()

import {
    TELEGRAM_BOT_API_TOKEN,
} from '@config/env';

const tgConfig = {
    token: TELEGRAM_BOT_API_TOKEN
}

export default {
    local: tgConfig,
    development: tgConfig,
    production: tgConfig
};