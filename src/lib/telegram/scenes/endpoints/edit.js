import { Scenes } from 'telegraf';
import { SCENE_NAME_EDIT_ENDPOINT, SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import { isMessageNullOrEmpty, sendValidationFailedMessage } from '@lib/telegram/message';
import { addToDate } from '@lib/date';
import models from '@/models';
import log from '@lib/log';

const editEndpoint = new Scenes.WizardScene(SCENE_NAME_EDIT_ENDPOINT,
	async (context) => {
		context.wizard.state.endpoint = {};
		
		await context.replyWithHTML(`<b>Enter when endpoint expires in</b> \nInput: <i>amount</i> <i>unit</i> \nAvailable units: second, minute, hour, day, week, month, quarter, year \ne.g 60 days, 2 weeks, 1 year \n\n📌 you can type <i>never</i> and it won't expire \n📌 if you don't want to edit click /cancel`);
		return context.wizard.next();
	},
	async (context) => {
		const paramName = 'expiration';
		
		if (isMessageNullOrEmpty(context))
			return await sendValidationFailedMessage(context, paramName);
		
		if (context.message.text.toLowerCase() === 'never') {
			context.wizard.state.endpoint.expireAt = null;
			return await saveEndpoint(context);
		}
		
		const literals = context.message.text.split(' ');
		
		if (literals.length !== 2)
			return await sendValidationFailedMessage(context, paramName);
		
		try {
			const amount = parseInt(literals[0]);
			const unit = literals[1];
			
			if (isNaN(amount) || amount < 1)
				return await sendValidationFailedMessage(context, paramName);
			
			context.wizard.state.endpoint.expireAt = addToDate(new Date(), amount, unit);
		} catch (e) {
			return await sendValidationFailedMessage(context, paramName);
		}
		
		await saveEndpoint(context);
	});

editEndpoint.command('cancel', async (context) => {
	delete context.wizard.state.endpoint;
	await context.scene.enter(SCENE_NAME_ENDPOINTS);
});

async function saveEndpoint(context) {
	try {
		await models.Endpoint.update(context.wizard.state.endpoint, { where: { id: context.wizard.state.endpointId } });
		
		await context.replyWithHTML(`✅ Endpoint was saved!`);
		
		delete context.wizard.state.endpoint;
		return await context.scene.enter(SCENE_NAME_ENDPOINTS);
	} catch (e) {
		log.error(e);
		await context.replyWithHTML(`⚠️ Error occurred while saving endpoint, try click /save again!`);
	}
}

export default editEndpoint;