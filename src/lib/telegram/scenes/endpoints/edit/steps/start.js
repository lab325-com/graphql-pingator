import { ENDPOINT_NEVER_EXPIRES_VALUE } from '@constants/Endpoint';

export default async context => {
	context.wizard.state.endpoint = {};
	
	await context.replyWithHTML(`<b>Enter when endpoint expires in</b> \nInput: <i>amount</i> <i>unit</i> \nAvailable units: second, minute, hour, day, week, month, quarter, year \ne.g 60 days, 2 weeks, 1 year \n\n📌 you can type <i>${ENDPOINT_NEVER_EXPIRES_VALUE}</i> and it won't expire \n📌 if you don't want to edit click /cancel`);
	return context.wizard.next();
}