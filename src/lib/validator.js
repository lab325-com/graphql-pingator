export const isValidHttpUrl = (string) => {
	const httpUrlPattern = /^http:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}(\/[-a-zA-Z0-9()@:%_+.~#?&//=]*)?$/;
	
	return httpUrlPattern.test(string);
}

export const isValidJsonString = (str) => {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}