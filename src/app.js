import { config } from 'dotenv';
import bot from '@lib/telegram';
import log from '@lib/log';
import { pgBossStartHandling } from '@lib/pgBoss/handlers';

config();

const init = async () => {
	await pgBossStartHandling();
	
	bot.launch();
	
	log.info('🚀 Telegram Bot was started');
};


init().catch(log.error);