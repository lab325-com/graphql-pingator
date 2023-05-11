import pgBoss from '@lib/pgBoss';
import log from '@lib/log';
import models from '@models';
import { Op } from 'sequelize';

export const pgBossStartHandling = async () => {
	await pgBoss.deleteAllQueues();
	
	const endpoints = await models.Endpoint.findAll({
		where: {
			[Op.or]: [
				{ expireAt: { [Op.gt]: new Date() } },
				{ expireAt: null }
			]
		}
	});
	
	for (const endpoint of endpoints) await endpoint.runMonitoring();
	
	log.info(`I handle ${endpoints.length} queues`);
};