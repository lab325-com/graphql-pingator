import { Scenes } from 'telegraf';
import models from '@models';
import log from '@lib/log';
import { SCENE_NAME_ADD_ENDPOINT, SCENE_NAME_ENDPOINTS } from '@constants/Scene';
import { COMMAND_NAME_CANCEL, COMMAND_NAME_SAVE } from '@constants/Command';
import starterStep from 'steps/start';
import nameStep from 'steps/name';
import typeStep from 'steps/type';
import urlStep from 'steps/url';
import httpMethodStep from 'steps/httpMethod';
import successStatusCode from 'steps/successStatusCode';
import dataStep from 'steps/data';
import intervalStep from 'steps/interval';
import expirationStep from 'steps/expiration';

export const createEndpoint = async context => {
	try {
		await models.Endpoint.create(context.wizard.state.endpoint);
		
		await context.replyWithHTML(`✅ New endpoint was created!`);
		
		delete context.wizard.state.endpoint;
		return await context.scene.enter(SCENE_NAME_ENDPOINTS);
	} catch (e) {
		log.error(e);
		await context.replyWithHTML(`⚠️ Error occurred while creating new endpoint, try click /${COMMAND_NAME_SAVE} again!`);
	}
};

const addEndpointScene = new Scenes.WizardScene(SCENE_NAME_ADD_ENDPOINT,
	starterStep,
	nameStep,
	typeStep,
	urlStep,
	httpMethodStep,
	successStatusCode,
	dataStep,
	intervalStep,
	expirationStep);

addEndpointScene.command(COMMAND_NAME_CANCEL, async context => {
	delete context.wizard.state.endpoint;
	await context.scene.enter(SCENE_NAME_ENDPOINTS);
});

addEndpointScene.command(COMMAND_NAME_SAVE, async context => {
	if (context.wizard.state.canSave === true)
		await createEndpoint(context);
});


export default addEndpointScene;