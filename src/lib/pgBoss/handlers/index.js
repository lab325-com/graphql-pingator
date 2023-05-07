import pgBoss from '@lib/pgBoss';
import log from '@lib/log';
import models from '@models';
import { Op } from 'sequelize';
import { addToDate, isLaterThanNow } from '@lib/date';

const endpointHandler = async (job) => {
	// console.log(`Handling job ${job.id}: ${job.data}`);
	log.info(job)
	
	if (job.data.expireAt && !isLaterThanNow(job.data.expireAt)) {
		log.info(`${job.data.name} expired`)
		return await job.done();
	}
	
	// fetch the api ...
	
	await pgBoss.send(job.name, job.data, { startAfter: addToDate(new Date(), job.data.interval, 'seconds') });
	
	await job.done();
}

export default async () => {
	await pgBoss.deleteAllQueues()
	
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
		const id = `endpoint_${endpoint.id}_${endpoint.name}`;
		await pgBoss.work(id, { }, endpointHandler);
		await pgBoss.send(id, endpoint, { });
		
		/* if (!endpoint.expireAt) {
			await pgBoss.subscribe('exp')
		} */
	}
	
	log.info(`Scheduled ${endpoints.length} jobs`)
}