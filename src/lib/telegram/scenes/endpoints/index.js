const { Scenes, Markup } = require('telegraf');
const models = require('../../../../models');
const { fmt, bold } = require('telegraf/format');
const {
	SCENE_NAME_ENDPOINTS,
	SCENE_NAME_ADD_ENDPOINT,
	SCENE_NAME_DELETE_ENDPOINT,
	SCENE_NAME_EDIT_ENDPOINT
} = require('../../../../constants/Scene');
const { getHumanReadableDateDifference } = require('../../../date');
const { ENDPOINT_TYPE_REST } = require('../../../../constants/Endpoint');

const endpointsPerPage = 5;

const prevPageButton = 'prevPage';
const nextPageButton = 'nextPage';
const pageButton = 'page';

const callbackDataSeparator = '__';

function callbackData(id, data) {
	return id + callbackDataSeparator + data;
}

async function getInlineEndpointsKeyboard(chatId, sceneEnteredAt, page) {
	if (!page)
		page = 0;
	
	const { count, rows } = await models.Endpoint.findAndCountAll({
		attributes: ['id', 'name', 'type', 'expireAt'],
		where: {
			chatId: chatId
		},
		limit: endpointsPerPage,
		offset: page * endpointsPerPage
	});
	
	const buttons = [];
	for (const endpoint of rows) {
		let buttonText = `${endpoint.name} (${endpoint.type})`;
		
		if (endpoint.expireAt === null)
			buttonText += ' ♾️';
		else if (new Date().getTime() >= new Date(endpoint.expireAt).getTime())
			buttonText += ' ⌛';
		
		buttons.push([Markup.button.callback(buttonText, callbackData(sceneEnteredAt, endpoint.id))]);
	}
	
	const maxPage = Math.ceil(count / endpointsPerPage);
	
	buttons.push([
		Markup.button.callback(`⬅️`, callbackData(sceneEnteredAt, prevPageButton)),
		Markup.button.callback(`page ${page + 1}/${maxPage}`, pageButton),
		Markup.button.callback(`➡️`, callbackData(sceneEnteredAt, nextPageButton))
	]);
	
	const keyboard = Markup.inlineKeyboard(buttons);
	
	return { keyboard, rows, count, maxPage };
}

const endpoints = new Scenes.BaseScene(SCENE_NAME_ENDPOINTS);

endpoints.enter(async (context) => {
	delete context.scene.state.maxPage;
	delete context.scene.state.page;
	
	context.scene.state.enteredAt = new Date().getTime()
		.toString();
	
	const message = await context.replyWithHTML('Loading...');
	
	const timeout = setTimeout(async () => {
		await context.telegram.editMessageText(message.chat.id, message.message_id, null, 'Still loading...');
	}, 1000);
	
	const {
		keyboard,
		count,
		maxPage
	} = await getInlineEndpointsKeyboard(context.message.chat.id.toString(), context.scene.state.enteredAt);
	
	context.scene.state.maxPage = maxPage;
	
	clearTimeout(timeout);
	
	if (count === 0) {
		await context.telegram.editMessageText(message.chat.id, message.message_id, null, fmt`You have ${bold('0')} endpoints\n\n📌 To add new endpoint click /add`);
	} else {
		await context.telegram.editMessageText(message.chat.id, message.message_id, null, fmt`${bold(`List of Endpoints (${count})`)}\n\n📌 To add new endpoint click /add \n📌 Toggle any endpoint to see its details and then edit or delete it`, keyboard);
	}
});

endpoints.command('add', async (context) => {
	await context.scene.enter(SCENE_NAME_ADD_ENDPOINT);
});

endpoints.command('delete', async (context) => {
	if (!context.scene.state.selectedEndpoint) return;
	
	await context.scene.enter(SCENE_NAME_DELETE_ENDPOINT, { endpointId: context.scene.state.selectedEndpoint.id });
});

endpoints.command('edit', async (context) => {
	if (!context.scene.state.selectedEndpoint) return;
	
	await context.scene.enter(SCENE_NAME_EDIT_ENDPOINT, { endpointId: context.scene.state.selectedEndpoint.id });
});

endpoints.on('callback_query', async (context) => {
	if (!context.scene.state.page)
		context.scene.state.page = 0;
	
	if (context.callbackQuery.data === callbackData(context.scene.state.enteredAt, prevPageButton)) {
		if (context.scene.state.page > 0) {
			context.scene.state.page--;
			const { keyboard } = await getInlineEndpointsKeyboard(context.callbackQuery.message.chat.id.toString(), context.scene.state.enteredAt, context.scene.state.page);
			await context.editMessageReplyMarkup(keyboard.reply_markup);
		}
		
		return await context.answerCbQuery();
	} else if (context.callbackQuery.data === callbackData(context.scene.state.enteredAt, nextPageButton)) {
		if (context.scene.state.page + 1 < context.scene.state.maxPage) {
			context.scene.state.page++;
			const { keyboard } = await getInlineEndpointsKeyboard(context.callbackQuery.message.chat.id.toString(), context.scene.state.enteredAt, context.scene.state.page);
			await context.editMessageReplyMarkup(keyboard.reply_markup);
		}
		
		return await context.answerCbQuery();
	} else if (context.callbackQuery.data === pageButton) {
		return await context.answerCbQuery();
	}
	
	const literals = String(context.callbackQuery.data).split('__');
	const sceneEnteredAt = literals[0];
	
	if (sceneEnteredAt !== String(context.scene.state.enteredAt))
		return await context.answerCbQuery();
	
	const endpointId = literals[1];
	
	if (context.scene.state.selectedEndpoint && context.scene.state.selectedEndpoint.id === endpointId)
		return await context.answerCbQuery();
	
	const endpoint = await models.Endpoint.findByPk(endpointId, { where: { chatId: context.callbackQuery.message.chat.id.toString() } });
	
	context.scene.state.selectedEndpoint = endpoint;
	
	if (context.scene.state.selectedEndpointMessageId)
		await context.telegram.deleteMessage(context.callbackQuery.message.chat.id, context.scene.state.selectedEndpointMessageId);
	
	
	let endpointsRepresentation = `✅ Selected endpoint <b>${endpoint.name}</b>\n`;
	
	if (endpoint.expireAt === null)
		endpointsRepresentation += `never expires ♾️\n`;
	else if (new Date().getTime() < new Date(endpoint.expireAt).getTime())
		endpointsRepresentation += `expires in: ${getHumanReadableDateDifference(new Date(), endpoint.expireAt)}\n`;
	else
		endpointsRepresentation += `already expired ⌛\n`;
	
	endpointsRepresentation += `url: ${endpoint.url}\n`;
	endpointsRepresentation += `type: ${endpoint.type}\n`;
	endpointsRepresentation += `data: ${endpoint.data}\n`;
	
	if (endpoint.type === ENDPOINT_TYPE_REST) {
		endpointsRepresentation += `http method: ${endpoint.httpMethod}\n`;
		endpointsRepresentation += `rest success status: ${endpoint.restSuccessStatus}\n`;
	}
	
	endpointsRepresentation += `\n📌 Click /delete or /edit`;
	
	const message = await context.replyWithHTML(endpointsRepresentation);
	
	context.scene.state.selectedEndpointMessageId = message.message_id;
	
	await context.answerCbQuery();
});

module.exports = endpoints;