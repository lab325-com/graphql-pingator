import { Scenes } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import models from '@models';
import _ from 'lodash';
import { ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import { DateTime } from 'luxon';
import { COMMAND_NAME_ADD, COMMAND_NAME_DELETE, COMMAND_NAME_EDIT } from '@constants/Command';
import TelegramBot from '@classes/TelegramBot';
import { ENDPOINTS_PER_PAGE } from '@config/env';

import {
	SCENE_NAME_ADD_ENDPOINT,
	SCENE_NAME_DELETE_ENDPOINT,
	SCENE_NAME_EDIT_ENDPOINT,
	SCENE_NAME_ENDPOINTS
} from '@constants/Scene';
import {
	PAGINATION_NEXT_PAGE_BUTTON,
	PAGINATION_PAGE_BUTTON,
	PAGINATION_PREVIOUS_PAGE_BUTTON
} from '@constants/Pagination';

const setSceneId = context => {
	context.scene.state.id = DateTime.now().toMillis()
		.toString();
};

const getSelectedEndpointRepresentationText = endpoint => {
	let endpointsRepresentation = `✅ Selected endpoint <b>${endpoint.name}</b>\n`;
	
	if (!endpoint.expireAt)
		endpointsRepresentation += `never expires ♾️\n`;
	else {
		const expireAt = DateTime.fromJSDate(endpoint.expireAt);
		
		endpointsRepresentation += DateTime.now() < expireAt
			? `expires in: ${expireAt.diffNow(['months', 'days', 'hours', 'minutes'])
				.toFormat('d \'days,\' h \'hours,\' m \'minutes and\' s \'seconds\'')}\n`
			: `already expired ⌛\n`;
	}
	
	const dataKeys = ['url', 'type', 'data', 'interval'];
	
	if (ENDPOINT_TYPE_REST === endpoint.type)
		dataKeys.push('httpMethod', 'restSuccessStatus');
	
	for (const key of dataKeys)
		endpointsRepresentation += `${_.startCase(key)}: ${endpoint[key]}\n`;
	
	endpointsRepresentation += `\n📌 Click /delete or /edit`;
	
	return endpointsRepresentation;
};
const getSceneId = context => context.scene.state.id;

async function getInlineEndpointsKeyboard(chatId, sceneId, page = 0) {
	const { Pagination: { totalPages, total }, Endpoinsts } = await models.Endpoint.paginate({
		where: { chatId: chatId },
		limit: ENDPOINTS_PER_PAGE,
		offset: page * ENDPOINTS_PER_PAGE
	});
	
	const rows = Endpoinsts.reduce((acc, e) => ({
		...acc,
		[e.id]: `${e.name} (${e.type}) ${e.expireAt ? DateTime.now() < DateTime.fromJSDate(e.expireAt) ? '♾️' : '⌛' : ''}`
	}), {});
	
	const keyboard = TelegramBot.createPaginationKeyboard({ rows, page, totalPages, sceneId });
	
	return { keyboard, rows, total, totalPages };
}

const endpointsScene = new Scenes.BaseScene(SCENE_NAME_ENDPOINTS);

endpointsScene.enter(async context => {
	context.scene.state = _.omit(context.scene.state, ['totalPages', 'page']);
	
	setSceneId(context);
	
	const {
		keyboard,
		total,
		totalPages
	} = await getInlineEndpointsKeyboard(context.message.chat.id.toString(), context.scene.state.id);
	
	context.scene.state.totalPages = totalPages;
	
	const answer = total
		? fmt`${bold(`List of Endpoints (${total})`)}\n\n📌 To add new endpoint click /add \n📌 Toggle any endpoint to see its details and then edit or delete it`
		: fmt`You have ${bold('0')} endpoints\n\n📌 To add new endpoint click /add`;
	
	await context.reply(answer, keyboard);
});


const commands = {
	[COMMAND_NAME_ADD]: async context => await context.scene.enter(SCENE_NAME_ADD_ENDPOINT),
	[COMMAND_NAME_DELETE]: async context => {
		if (!context.scene.state.selectedEndpoint) return;
		
		await context.scene.enter(SCENE_NAME_DELETE_ENDPOINT, { endpointId: context.scene.state.selectedEndpoint.id });
	},
	[COMMAND_NAME_EDIT]: async context => {
		if (!context.scene.state.selectedEndpoint) return;
		
		await context.scene.enter(SCENE_NAME_EDIT_ENDPOINT, { endpointId: context.scene.state.selectedEndpoint.id });
	}
};

for (const command in commands)
	endpointsScene.command(command, commands[command]);

endpointsScene.on('callback_query', async context => {
	const currentSceneId = getSceneId(context);
	const callbackData = context.callbackQuery.data;
	const chatId = context.callbackQuery.message.chat.id;
	
	if (!context.scene.state.page) context.scene.state.page = 0;
	
	const { sceneId, buttonName } = TelegramBot.parseButtonId(callbackData);
	
	if (sceneId !== currentSceneId) return await context.answerCbQuery();
	
	switch (buttonName) {
		case PAGINATION_PREVIOUS_PAGE_BUTTON:
			if (context.scene.state.page > 0) {
				context.scene.state.page--;
				
				const { keyboard } = await getInlineEndpointsKeyboard(chatId.toString(), currentSceneId, context.scene.state.page);
				await context.editMessageReplyMarkup(keyboard.reply_markup);
			}
			break;
		
		case PAGINATION_NEXT_PAGE_BUTTON:
			if (context.scene.state.page + 1 < context.scene.state.totalPages) {
				context.scene.state.page++;
				
				const { keyboard } = await getInlineEndpointsKeyboard(chatId.toString(), currentSceneId, context.scene.state.page);
				await context.editMessageReplyMarkup(keyboard.reply_markup);
			}
			break;
		case PAGINATION_PAGE_BUTTON:
			break;
		default:
			const endpoint = await models.Endpoint.findByPk(buttonName, { where: { chatId: chatId.toString() } });
			
			context.scene.state.selectedEndpoint = endpoint;
			
			if (context.scene.state.selectedEndpointMessageId)
				await context.telegram.deleteMessage(chatId, context.scene.state.selectedEndpointMessageId);
			
			const message = await context.replyWithHTML(getSelectedEndpointRepresentationText(endpoint));
			
			context.scene.state.selectedEndpointMessageId = message.message_id;
	}
	
	return await context.answerCbQuery();
});

export default endpointsScene;