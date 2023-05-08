import { Scenes } from 'telegraf';
import log from '@lib/log';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import { isValidHttpUrl, isValidJsonString } from '@lib/validator';
import { HTTP_METHOD_GET, HTTP_METHOD_POST } from '@constants/Http';
import models from '@/models';
import { SCENE_NAME_ADD_ENDPOINT, SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import { addToDate } from '@lib/date';
import { isMessageNullOrEmpty, sendValidationFailedMessage } from '@lib/telegram/message';

const addEndpoint = new Scenes.WizardScene(SCENE_NAME_ADD_ENDPOINT,
	async (ctx) => {
		ctx.wizard.state.endpoint = {};
		ctx.wizard.state.canSave = false;
		
		await ctx.replyWithHTML(`<b>Enter name of your endpoint</b> \n\n📌 if you don't want to add new endpoint you can type /cancel`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'name';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx, paramName);
		
		ctx.wizard.state.endpoint.chatId = ctx.message.chat.id.toString();
		ctx.wizard.state.endpoint.name = ctx.message.text.trim();
		
		await ctx.replyWithHTML(`<b>Enter type of endpoint.</b> Available types: \n✔️ ${ENDPOINT_TYPE_REST}; \n✔️ ${ENDPOINT_TYPE_GRAPHQL}`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'type';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx, paramName);
		
		const type = ctx.message.text.toLowerCase();
		
		if (type !== ENDPOINT_TYPE_REST && type !== ENDPOINT_TYPE_GRAPHQL)
			return await sendValidationFailedMessage(ctx, paramName);
		
		ctx.wizard.state.endpoint.type = type;
		
		await ctx.replyWithHTML(`<b>Enter url of endpoint</b>`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'url';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx, paramName);
		
		const url = ctx.message.text;
		
		if (!isValidHttpUrl(url))
			return await sendValidationFailedMessage(ctx, paramName);
		
		ctx.wizard.state.endpoint.url = url;
		
		if (ctx.wizard.state.endpoint.type === ENDPOINT_TYPE_GRAPHQL) {
			await ctx.replyWithHTML(`<b>Enter data/options that will be sent in request.</b>\ne.g. { "headers": { "Authorization": "token" }, "body": { ... } }`);
			return ctx.wizard.selectStep(ctx.wizard.cursor + 3);
		}
		
		await ctx.replyWithHTML(`<b>Enter HTTP Method.</b> Available methods: \n✔️ ${HTTP_METHOD_GET}; \n✔️ ${HTTP_METHOD_POST}`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'HTTP Method';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx, paramName);
		
		const httpMethod = ctx.message.text.toUpperCase();
		
		if (httpMethod !== HTTP_METHOD_GET && httpMethod !== HTTP_METHOD_POST)
			return await sendValidationFailedMessage(ctx, paramName);
		
		ctx.wizard.state.endpoint.httpMethod = httpMethod;
		
		await ctx.replyWithHTML(`<b>Enter success status code of endpoint</b> \ne.g. 200`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'success status code';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx, paramName);
		
		const restSuccessStatus = parseInt(ctx.message.text);
		if (isNaN(restSuccessStatus) || restSuccessStatus < 100 || restSuccessStatus > 599)
			return await sendValidationFailedMessage(ctx, paramName);
		
		ctx.wizard.state.endpoint.restSuccessStatus = restSuccessStatus;
		
		await ctx.replyWithHTML(`<b>Enter data/options JSON that will be sent in request.</b>\ne.g. { "headers": { "Authorization": "token" }, "body": { ... } }`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'data/options';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx);
		
		const data = ctx.message.text.replaceAll('\n', '');
		
		if (!isValidJsonString(data))
			return await sendValidationFailedMessage(ctx, paramName);
		
		ctx.wizard.state.endpoint.data = data;
		
		await ctx.replyWithHTML(`<b>Enter interval in seconds</b>`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'interval';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx, paramName);
		
		const interval = parseInt(ctx.message.text);
		if (isNaN(interval) || interval < 1 || interval > 2147483647)
			return await sendValidationFailedMessage(ctx, paramName);
		
		ctx.wizard.state.endpoint.interval = interval;
		ctx.wizard.state.canSave = true;
		
		await ctx.replyWithHTML(`<b>Enter when endpoint expires in</b> \nInput: <i>amount</i> <i>unit</i> \nAvailable units: second, minute, hour, day, week, month, quarter, year \ne.g 60 days, 2 weeks, 1 year \n\n📌 you can type <i>never</i> or click just /save and it won't expire`);
		return ctx.wizard.next();
	},
	async (ctx) => {
		const paramName = 'expiration';
		
		if (isMessageNullOrEmpty(ctx))
			return await sendValidationFailedMessage(ctx, paramName);
		
		if (ctx.message.text.toLowerCase() === 'never')
			return await createEndpoint(ctx);
		
		const literals = ctx.message.text.split(' ');
		
		if (literals.length !== 2)
			return await sendValidationFailedMessage(ctx, paramName);
		
		try {
			const amount = parseInt(literals[0]);
			const unit = literals[1];
			
			if (isNaN(amount) || amount < 1)
				return await sendValidationFailedMessage(ctx, paramName);
			
			ctx.wizard.state.endpoint.expireAt = addToDate(new Date(), amount, unit);
		} catch (e) {
			return await sendValidationFailedMessage(ctx, paramName);
		}
		
		
		await createEndpoint(ctx);
	});

addEndpoint.command('cancel', async (ctx) => {
	delete ctx.wizard.state.endpoint;
	await ctx.scene.enter(SCENE_NAME_ENDPOINTS);
});

addEndpoint.command('save', async (ctx) => {
	if (ctx.wizard.state.canSave === true)
		await createEndpoint(ctx);
});

async function createEndpoint(ctx) {
	try {
		await models.Endpoint.create(ctx.wizard.state.endpoint);
		
		await ctx.replyWithHTML(`✅ New endpoint was created!`);
		
		delete ctx.wizard.state.endpoint;
		return await ctx.scene.enter(SCENE_NAME_ENDPOINTS);
	} catch (e) {
		log.error(e);
		await ctx.replyWithHTML(`⚠️ Error occurred while creating new endpoint, try click /save again!`);
	}
}

export default addEndpoint;