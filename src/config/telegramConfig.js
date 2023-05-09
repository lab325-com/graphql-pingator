import { config } from 'dotenv';
import { TELEGRAM_BOT_API_TOKEN } from '@config/env';

config();

const tgConfig = {
	token: TELEGRAM_BOT_API_TOKEN
};

export default {
	local: tgConfig,
	development: tgConfig,
	production: tgConfig
};