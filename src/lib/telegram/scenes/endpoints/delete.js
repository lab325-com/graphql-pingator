import { Scenes } from 'telegraf';
import { SCENE_NAME_DELETE_ENDPOINT, SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import models from '@models';
import { COMMAND_NAME_NO, COMMAND_NAME_YES } from '@constants/Command';

const deleteEndpointScene = new Scenes.BaseScene(SCENE_NAME_DELETE_ENDPOINT);

deleteEndpointScene.enter(async context => {
	if (!context.scene.state.endpointId)
		return context.scene.leave();
	
	await context.replyWithHTML(`⚠️ Are you sure you want to delete this endpoint? \n/${COMMAND_NAME_YES} or /${COMMAND_NAME_NO}`);
});

deleteEndpointScene.command(COMMAND_NAME_YES, async context => {
	const id = context.scene.state.endpointId;
	
	await models.Endpoint.destroy({
		where: { id, chatId: context.message.chat.id.toString() }
	});
	
	return context.scene.enter(SCENE_NAME_ENDPOINTS);
});

deleteEndpointScene.command(COMMAND_NAME_NO, async context => context.scene.enter(SCENE_NAME_ENDPOINTS));

export default deleteEndpointScene;