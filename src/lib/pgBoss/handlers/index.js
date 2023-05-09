import pgBoss from '@lib/pgBoss';
import log from '@lib/log';
import models from '@models';
import { Op } from 'sequelize';
import { runEndpointMonitoring, scheduleEndpointExpirationAlert } from '@lib/pgBoss/handlers/endpointMonitoring';

export const pgBossStartHandling = async () => {
	await pgBoss.deleteAllQueues();
	
	const endpoints = await models.Endpoint.findAll({
		where: {
			[Op.or]: [
				{
					expireAt: {
						[Op.gt]: new Date()
					}
				},
				{
					expireAt: null
				}
			]
		}
	});
	
	for (const endpoint of endpoints) {
		await runEndpointMonitoring(endpoint.id);
		await scheduleEndpointExpirationAlert(endpoint.id, endpoint.expireAt);
	}
	
	log.info(`Sent ${endpoints.length} jobs`);
};