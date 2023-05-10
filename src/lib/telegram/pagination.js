import { Markup } from 'telegraf';
import { callbackData } from '@lib/telegram/callbackQuery';

export const prevPageButton = 'prevPage';
export const nextPageButton = 'nextPage';
export const pageButton = 'page';

export const getPagesCount = (itemsCount, itemsPerPage) => Math.ceil(itemsCount / itemsPerPage);

export const createPaginationKeyboard = (items, displaySelector, callbackDataSelector, currentPage, pagesCount, sceneId) => {
	if (!currentPage)
		currentPage = 0;
	
	const buttons = [];
	for (const item of items) {
		const buttonText = displaySelector(item);
		const callbackData = callbackDataSelector(item);
		buttons.push([
			Markup.button.callback(buttonText, callbackData(sceneId, callbackData))
		]);
	}
	
	buttons.push([
		Markup.button.callback(`⬅️`, callbackData(sceneId, prevPageButton)),
		Markup.button.callback(`page ${currentPage + 1}/${pagesCount}`, pageButton),
		Markup.button.callback(`➡️`, callbackData(sceneId, nextPageButton))
	]);
	
	return Markup.inlineKeyboard(buttons);
};