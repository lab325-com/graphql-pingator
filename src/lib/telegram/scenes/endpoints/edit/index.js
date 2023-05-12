import { Scenes } from 'telegraf';
import { SCENE_NAME_EDIT_ENDPOINT, SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import models from '@models';
import log from '@lib/log';
import { COMMAND_NAME_CANCEL } from '@constants/Command';
import startStep from './steps/start'
import expirationStep from './steps/expiration'

export const saveEndpoint = async (context) => {
	try {
		const endpointId = context.wizard.state.endpointId;
		
		const endpoint = await models.Endpoint.findByPk(endpointId);
		
		await endpoint.update(context.wizard.state.endpoint);
		
		await context.replyWithHTML(`✅ Endpoint was saved!`);
		
		delete context.wizard.state.endpoint;
		return await context.scene.enter(SCENE_NAME_ENDPOINTS);
	} catch (e) {
		log.error(e);
		await context.replyWithHTML(`⚠️ Error occurred while saving endpoint, try click /save again!`);
	}
};

const editEndpointScene = new Scenes.WizardScene(SCENE_NAME_EDIT_ENDPOINT,
	startStep,
	expirationStep);

editEndpointScene.command(COMMAND_NAME_CANCEL, async context => {
	delete context.wizard.state.endpoint;
	await context.scene.enter(SCENE_NAME_ENDPOINTS);
});

export default editEndpointScene;