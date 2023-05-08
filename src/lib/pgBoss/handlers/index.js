import pgBoss from '@lib/pgBoss';
import log from '@lib/log';
import models from '@models';
import { Op } from 'sequelize';
import { addToDate, isLaterThanNow } from '@lib/date';
import { PG_BOSS_JOB_CHECK_INTERVAL_MS } from '@config/env';
import bot from '@lib/telegram';
import { bold, fmt } from 'telegraf/format';

const endpointExpirationAlertHandler = async job => {
	const endpoint = await models.Endpoint.findByPk(job.data.endpointId);
	await bot.telegram.sendMessage(endpoint.chatId, fmt`⌛ Endpoint ${bold(endpoint.name)} has been expired`);
};

const endpointHandler = async job => {
	try {
		const endpoint = await models.Endpoint.findByPk(job.data.endpointId);
		
		if (!endpoint) {
			log.info(`${job.data.endpointId} doesn't exist anymore`);
			await pgBoss.complete(job.id);
			return;
		}
		
		if (endpoint.expireAt && !isLaterThanNow(new Date(endpoint.expireAt))) {
			log.info(`${endpoint.name} is expired`);
			await pgBoss.complete(job.id);
			return;
		}
		
		// hit the api ...
		
		const startAfter = addToDate(new Date(), endpoint.interval, 'seconds');
		await pgBoss.send(job.name, job.data, { startAfter });
	} catch (e) {
		log.error(e);
	}
	
	await pgBoss.complete(job.id);
};

const workerOptions = {
	newJobCheckInterval: PG_BOSS_JOB_CHECK_INTERVAL_MS
};

const endpointQueueName = endpointId => `endpoint_${endpointId}`;
const endpointExpirationAlertQueueName = endpointId => `${endpointQueueName(endpointId)}_expiration_alert`;

const expirationAlertJobs = {};

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
		const queueName = endpointQueueName(endpoint.id);
		await pgBoss.work(queueName, workerOptions, endpointHandler);
		await pgBoss.send(queueName, { endpointId: endpoint.id }, {});
		
		if (endpoint.expireAt) {
			const expirationQueueName = endpointExpirationAlertQueueName(endpoint.id);
			await pgBoss.work(expirationQueueName, workerOptions, endpointExpirationAlertHandler);
			expirationAlertJobs[endpoint.id] =
				await pgBoss.send(expirationQueueName, { endpointId: endpoint.id }, { startAfter: endpoint.expireAt });
		}
	}
	
	log.info(`Sent ${endpoints.length} jobs`);
};

export const editExpirationAlertJob = async (endpointId, expireAt) => {
	const jobId = expirationAlertJobs[endpointId];
	
	if (jobId) {
		await pgBoss.cancel(jobId);
	}
	
	const queueName = endpointExpirationAlertQueueName(endpointId);
	
	if (!jobId)
		await pgBoss.work(queueName, workerOptions, endpointExpirationAlertHandler);
	
	expirationAlertJobs[endpointId] = await pgBoss.send(queueName, { endpointId: endpointId }, { startAfter: expireAt });
};