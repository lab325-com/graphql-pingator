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
	const endpoint = await models.Endpoint.findByPk(job.data.endpointId);
	
	if (!endpoint) {
		log.info(`Cannot check endpoint ${job.data.endpointId} because it doesn't exist anymore`);
		runningEndpointChecks.splice(runningEndpointChecks.indexOf(endpoint.id), 1);
		await pgBoss.complete(job.id);
		return;
	}
	
	if (endpoint.expireAt && !isLaterThanNow(new Date(endpoint.expireAt))) {
		log.info(`Cannot check endpoint ${endpoint.name} because it is expired`);
		runningEndpointChecks.splice(runningEndpointChecks.indexOf(endpoint.id), 1);
		await pgBoss.complete(job.id);
		return;
	}
	
	await bot.telegram.sendMessage(endpoint.chatId, fmt`check was performed`);
	
	const startAfter = addToDate(new Date(), endpoint.interval, 'seconds');
	await pgBoss.send(job.name, job.data, { startAfter });
	
	await pgBoss.complete(job.id);
};

const workerOptions = {
	newJobCheckInterval: PG_BOSS_JOB_CHECK_INTERVAL_MS
};

const endpointQueueName = endpointId => `endpoint_${endpointId}`;
const endpointExpirationAlertQueueName = endpointId => `${endpointQueueName(endpointId)}_expiration_alert`;

const expirationAlertJobs = {};
const runningEndpointChecks = [];

const startCheckingEndpoint = async (endpointId) => {
	runningEndpointChecks.push(endpointId);
	const queueName = endpointQueueName(endpointId);
	await pgBoss.work(queueName, workerOptions, endpointHandler);
	await pgBoss.send(queueName, { endpointId: endpointId }, {});
}

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
		await startCheckingEndpoint(endpoint.id);
		
		if (endpoint.expireAt) {
			const expirationQueueName = endpointExpirationAlertQueueName(endpoint.id);
			await pgBoss.work(expirationQueueName, workerOptions, endpointExpirationAlertHandler);
			expirationAlertJobs[endpoint.id] =
				await pgBoss.send(expirationQueueName, { endpointId: endpoint.id }, { startAfter: endpoint.expireAt });
		}
	}
	
	log.info(`Sent ${endpoints.length} jobs`);
};

export const setEndpointExpirationAlertJob = async (endpointId, expireAt) => {
	const jobId = expirationAlertJobs[endpointId];
	
	if (jobId)
		await pgBoss.cancel(jobId);
	
	if (!expireAt)
		return;
	
	const isRunning = runningEndpointChecks.includes(endpointId);
	
	if (!isRunning)
		await startCheckingEndpoint(endpointId);
	
	const queueName = endpointExpirationAlertQueueName(endpointId);
	
	if (!jobId)
		await pgBoss.work(queueName, workerOptions, endpointExpirationAlertHandler);
	
	expirationAlertJobs[endpointId] = await pgBoss.send(queueName, { endpointId: endpointId }, { startAfter: expireAt });
};