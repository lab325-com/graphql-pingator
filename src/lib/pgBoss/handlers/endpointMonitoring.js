import models from '@models';
import bot from '@lib/telegram';
import { bold, fmt, italic } from 'telegraf/format';
import log from '@lib/log';
import pgBoss from '@lib/pgBoss';
import { addToDate, isLaterThanNow } from '@lib/date';
import { PG_BOSS_JOB_CHECK_INTERVAL_MS } from '@config/env';
import { endpointExpirationAlertQueueName, endpointQueueName } from '@lib/pgBoss/queueNames';
import Monitor from '@classes/Monitor';

const endpointExpirationAlertHandler = async job => {
	const endpoint = await models.Endpoint.findByPk(job.data.endpointId);
	await bot.telegram.sendMessage(endpoint.chatId, fmt`⌛ Endpoint ${bold(endpoint.name)} has been expired`);
};

const endpointHandler = async job => {
	const endpoint = await models.Endpoint.findByPk(job.data.endpointId);
	
	if (!endpoint) {
		log.info(`Cannot check endpoint ${job.data.endpointId} because it doesn't exist anymore`);
		monitoredEndpoints.splice(monitoredEndpoints.indexOf(endpoint.id), 1);
		await pgBoss.complete(job.id);
		return;
	}
	
	if (endpoint.expireAt && !isLaterThanNow(new Date(endpoint.expireAt))) {
		log.info(`Cannot check endpoint ${endpoint.name} because it is expired`);
		monitoredEndpoints.splice(monitoredEndpoints.indexOf(endpoint.id), 1);
		await pgBoss.complete(job.id);
		return;
	}
	
	const monitor = new Monitor(endpoint);
	const monitorResult = await monitor.pingOnce();
	
	if (!monitorResult.isSuccess)
		await bot.telegram.sendMessage(endpoint.chatId, fmt`❌ ${bold('ERROR')} occurred while monitoring endpoint ${bold(endpoint.name)}. Details: \n${italic(monitorResult.error)}`);
	
	const startAfter = addToDate(new Date(), endpoint.interval, 'seconds');
	await pgBoss.send(job.name, job.data, { startAfter });
	
	await pgBoss.complete(job.id);
};

const workerOptions = {
	newJobCheckInterval: PG_BOSS_JOB_CHECK_INTERVAL_MS
};

const expirationAlertJobs = {};
const monitoredEndpoints = [];

export const runEndpointMonitoring = async (endpointId) => {
	monitoredEndpoints.push(endpointId);
	
	const queueName = endpointQueueName(endpointId);
	await pgBoss.work(queueName, workerOptions, endpointHandler);
	await pgBoss.send(queueName, { endpointId: endpointId }, {});
};

export const isMonitoringEndpoint = (endpointId) => monitoredEndpoints.includes(endpointId);

export const scheduleEndpointExpirationAlert = async (endpointId, expireAt) => {
	const jobId = expirationAlertJobs[endpointId];
	
	if (jobId)
		await pgBoss.cancel(jobId);
	
	if (!expireAt)
		return;
	
	const queueName = endpointExpirationAlertQueueName(endpointId);
	
	if (!jobId)
		await pgBoss.work(queueName, workerOptions, endpointExpirationAlertHandler);
	
	expirationAlertJobs[endpointId] = await pgBoss.send(queueName, { endpointId: endpointId }, { startAfter: expireAt });
};