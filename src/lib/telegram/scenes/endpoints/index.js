import { Scenes } from 'telegraf';
import { bold, fmt } from 'telegraf/format';
import models from '@/models';
import {
	SCENE_NAME_ADD_ENDPOINT,
	SCENE_NAME_DELETE_ENDPOINT,
	SCENE_NAME_EDIT_ENDPOINT,
	SCENE_NAME_ENDPOINTS
} from '@constants/Scene';
import { getSelectedEndpointRepresentationText } from '@lib/endpoint';
import {
	createPaginationKeyboard,
	getPagesCount,
	nextPageButton,
	pageButton,
	prevPageButton
} from '@lib/telegram/pagination';
import { isLaterThanNow } from '@lib/date';
import { getCallbackDataParts, isCallbackDataEqual } from '@lib/telegram/callbackQuery';
import { sendLoadingMessage } from '@lib/telegram/message';

const endpointsPerPage = 5;

const endpointDisplaySelector = endpoint => {
	let buttonText = `${endpoint.name} (${endpoint.type})`;
	
	if (endpoint.expireAt === null)
		buttonText += ' ♾️';
	else if (!isLaterThanNow(new Date(endpoint.expireAt)))
		buttonText += ' ⌛';
	
	return buttonText;
};

async function getInlineEndpointsKeyboard(chatId, sceneId, page = 0) {
	const { count, rows } = await models.Endpoint.findAndCountAll({
		attributes: ['id', 'name', 'type', 'expireAt'],
		where: {
			chatId: chatId
		},
		limit: endpointsPerPage,
		offset: page * endpointsPerPage
	});
	
	const pagesCount = getPagesCount(count, endpointsPerPage);
	const keyboard = createPaginationKeyboard(rows, endpointDisplaySelector, item => item.id, page, pagesCount, sceneId);
	return { keyboard, rows, count, pagesCount };
}

const endpoints = new Scenes.BaseScene(SCENE_NAME_ENDPOINTS);

endpoints.enter(async (context) => {
	delete context.scene.state.pagesCount;
	delete context.scene.state.page;
	
	context.scene.state.id = new Date().getTime()
		.toString();
	
	const {
		cancelLoading,
		message
	} = await sendLoadingMessage(context);
	
	const {
		keyboard,
		count,
		pagesCount
	} = await getInlineEndpointsKeyboard(context.message.chat.id.toString(), context.scene.state.id);
	
	context.scene.state.pagesCount = pagesCount;
	
	cancelLoading();
	
	if (count === 0)
		await context.telegram.editMessageText(message.chat.id, message.message_id, null, fmt`You have ${bold('0')} endpoints\n\n📌 To add new endpoint click /add`);
	else
		await context.telegram.editMessageText(message.chat.id, message.message_id, null, fmt`${bold(`List of Endpoints (${count})`)}\n\n📌 To add new endpoint click /add \n📌 Toggle any endpoint to see its details and then edit or delete it`, keyboard);
});

endpoints.command('add', async (context) =>
	await context.scene.enter(SCENE_NAME_ADD_ENDPOINT));

endpoints.command('delete', async (context) => {
	if (!context.scene.state.selectedEndpoint) return;
	
	await context.scene.enter(SCENE_NAME_DELETE_ENDPOINT, { endpointId: context.scene.state.selectedEndpoint.id });
});

endpoints.command('edit', async (context) => {
	if (!context.scene.state.selectedEndpoint) return;
	
	await context.scene.enter(SCENE_NAME_EDIT_ENDPOINT, { endpointId: context.scene.state.selectedEndpoint.id });
});

endpoints.on('callback_query', async (context) => {
	const currentSceneId = context.scene.state.id.toString();
	const callbackData = context.callbackQuery.data;
	const chatId = context.callbackQuery.message.chat.id;
	
	if (!context.scene.state.page)
		context.scene.state.page = 0;
	
	if (isCallbackDataEqual(currentSceneId, prevPageButton, callbackData)) {
		if (context.scene.state.page > 0) {
			context.scene.state.page--;
			
			const { keyboard } = await getInlineEndpointsKeyboard(chatId.toString(), currentSceneId, context.scene.state.page);
			await context.editMessageReplyMarkup(keyboard.reply_markup);
		}
		
		return await context.answerCbQuery();
	} else if (isCallbackDataEqual(currentSceneId, nextPageButton, callbackData)) {
		if (context.scene.state.page + 1 < context.scene.state.pagesCount) {
			context.scene.state.page++;
			
			const { keyboard } = await getInlineEndpointsKeyboard(chatId.toString(), currentSceneId, context.scene.state.page);
			await context.editMessageReplyMarkup(keyboard.reply_markup);
		}
		
		return await context.answerCbQuery();
	} else if (callbackData === pageButton) {
		return await context.answerCbQuery();
	}
	
	const { sceneId, data } = getCallbackDataParts(callbackData);
	
	if (sceneId !== currentSceneId)
		return await context.answerCbQuery();
	
	if (context.scene.state.selectedEndpoint && context.scene.state.selectedEndpoint.id === data)
		return await context.answerCbQuery();
	
	const endpoint = await models.Endpoint.findByPk(data, { where: { chatId: chatId.toString() } });
	
	context.scene.state.selectedEndpoint = endpoint;
	
	if (context.scene.state.selectedEndpointMessageId)
		await context.telegram.deleteMessage(chatId, context.scene.state.selectedEndpointMessageId);
	
	const message = await context.replyWithHTML(getSelectedEndpointRepresentationText(endpoint));
	
	context.scene.state.selectedEndpointMessageId = message.message_id;
	
	await context.answerCbQuery();
});

export default endpoints;