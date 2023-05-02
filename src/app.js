import { config } from 'dotenv';

config();

import bot from '@lib/telegram/index';
import log from '@lib/log';

bot.launch();

log.info('🚀 Telegram Bot was started');