import { COMMAND_NAME_CANCEL } from '@constants/Command';

export default async context => {
	context.wizard.state.endpoint = {};
	context.wizard.state.canSave = false;
	
	await context.replyWithHTML(`<b>Enter name of your endpoint</b> \n\n📌 if you don't want to add new endpoint you can type /${COMMAND_NAME_CANCEL}`);
	return context.wizard.next();
}