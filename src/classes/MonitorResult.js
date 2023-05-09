export default class MonitorResult {
	constructor(isSuccess = true, error = null) {
		this.isSuccess = isSuccess;
		this.error = error;
	}
}