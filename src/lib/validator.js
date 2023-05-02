export const isValidHttpUrl = (string) => {
	return (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gm).test(string)
}

export const isValidJsonString = (str) => {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}