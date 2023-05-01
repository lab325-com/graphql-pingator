import { Scenes } from 'telegraf';
import { SCENE_NAME_DELETE_ENDPOINT, SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import models from '@/models';

const deleteEndpoint = new Scenes.BaseScene(SCENE_NAME_DELETE_ENDPOINT);

deleteEndpoint.enter(async (context) => {
	if (!context.scene.state.endpointId)
		return context.scene.leave();
	
	await context.replyWithHTML(`⚠️ Are you sure you want to delete this endpoint? \n/yes or /no`);
});

deleteEndpoint.command('yes', async (context) => {
	const endpointId = context.scene.state.endpointId;
	
	await models.Endpoint.destroy({ where: { id: endpointId, chatId: context.message.chat.id.toString() } });
	
	return context.scene.enter(SCENE_NAME_ENDPOINTS);
});

deleteEndpoint.command('no', async (context) =>
	context.scene.enter(SCENE_NAME_ENDPOINTS))

export default deleteEndpoint;