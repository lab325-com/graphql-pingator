import { DateTime } from 'luxon';
import telegram from '@lib/telegram';
import { bold, fmt, italic } from 'telegraf/format';
import pgBoss from '@lib/pgBoss';
import models from '@models';

export default async job => {
	try {
		const { endpointId } = job.data;
		
		const endpoint = await models.Endpoint.findByPk(endpointId);
		
		if (!endpoint) throw new Error(`Endpoint ${endpointId} not found.`);
		
		const { expireAt, name } = endpoint;
		
		if (expireAt && DateTime.now() > DateTime.fromJSDate(expireAt))
			return await telegram.sendMessage(endpoint.chatId, fmt`⌛ Endpoint ${bold(name)} has been expired`);
		
		const { isSuccess, message } = await endpoint.pingOnce();
		
		if (!isSuccess)
			await telegram.sendMessage(endpoint.chatId, fmt`❌ ${bold('ERROR')} occurred while monitoring endpoint ${bold(name)}. Details: \n${italic(message)}`);
		
		const startAfter = DateTime.now()
			.plus({ second: endpoint.interval })
			.toJSDate();
		
		await pgBoss.send(job.name, job.data, { startAfter });
		
		await pgBoss.complete(job.id);
	} catch (e) {
		await pgBoss.fail(job.id, e);
	}
}