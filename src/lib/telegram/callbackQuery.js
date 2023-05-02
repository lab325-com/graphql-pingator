const callbackDataSeparator = '__';

export const callbackData = (id, data) => id + callbackDataSeparator + data;

export const isCallbackDataEqual = (id, data, comparableCallbackData) =>
	callbackData(id, data) === comparableCallbackData;

export const getCallbackDataParts = (callbackData) => {
	const literals = String(callbackData).split(callbackDataSeparator);
	const sceneId = literals[0];
	const data = literals[1];
	
	return { sceneId, data };
};