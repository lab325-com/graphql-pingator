import axios from 'axios';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import MonitorResult from '@classes/MonitorResult';
import log from '@lib/log';

export default class Monitor {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}
	
	async pingOnce() {
		if (this.endpoint.type === ENDPOINT_TYPE_GRAPHQL) {
			try {
				const response = await axios({
					// timeout: 1,
					method: 'POST',
					url: this.endpoint.url,
					...JSON.parse(this.endpoint.data)
				});
				
				if (response.data.errors)
					return new MonitorResult(false, response.data.errors.map(e => e.message).join('\n'));
				
				return new MonitorResult(true);
			} catch (err) {
				log.error(err);
				return new MonitorResult(false, err.message);
			}
		} else if (this.endpoint.type === ENDPOINT_TYPE_REST) {
			try {
				const response = await axios({
					method: this.endpoint.httpMethod,
					url: this.endpoint.url,
					...JSON.parse(this.endpoint.data)
				});
				
				if (response.status !== this.endpoint.restSuccessStatus)
					return new MonitorResult(false, `Endpoint returned ${response.status} status code, expected status code is ${this.endpoint.restSuccessStatus}`);
				
				return new MonitorResult(true);
			} catch (err) {
				log.error(err);
				return new MonitorResult(false, err.message);
			}
		} else throw new Error(`Endpoint type ${this.endpoint.type} is not supported.`);
	}
}