const { Scenes } = require('telegraf');
const { SCENE_NAME_DELETE_ENDPOINT, SCENE_NAME_ENDPOINTS } = require('../../../../constants/Scene');
const models = require('../../../../models');

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

deleteEndpoint.command('no', async (context) => {
	return context.scene.enter(SCENE_NAME_ENDPOINTS);
});

module.exports = deleteEndpoint;