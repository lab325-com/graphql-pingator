import { TABLE_NAME_ENDPOINTS } from '@constants/Table';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import { HTTP_METHOD_GET, HTTP_METHOD_POST } from '@constants/Http';
import ExtendedModel from '@classes/ExtendedModel';
import pgBoss from '@lib/pgBoss';
import { PG_BOSS_JOB_CHECK_INTERVAL_MS } from '@config/env';
import { DateTime } from 'luxon';
import axios from 'axios';
import { MODEL_NAME_ENDPOINT } from '@constants/Model';
import endpointMonitoringHandler from '@lib/pgBoss/handlers/endpointMonitoringHandler';

module.exports = (sequelize, DataTypes) => {
	
	class Endpoint extends ExtendedModel {
		getQueueName() {
			return `Endpoint_${this.id}`;
		}
		
		async pingOnce() {
			const { type, httpMethod, url, data = {}, restSuccessStatus } = this;
			
			let method = httpMethod || HTTP_METHOD_POST;
			const result = { isSuccess: false, message: null };
			
			const response = await axios({
				method,
				url,
				...JSON.parse(data)
			}).catch(e => {
				result.message = e.message;
			});
			
			if (result.message)
				return result;
			
			switch (type) {
				case ENDPOINT_TYPE_GRAPHQL:
					if (response.data.errors) {
						result.message = response.data.errors.map(e => e.message).join('\n');
						return result;
					}
					break;
				case ENDPOINT_TYPE_REST:
					if (response.status !== restSuccessStatus) {
						result.message = `Endpoint returned ${response.status} status code, expected status code is ${this.endpoint.restSuccessStatus}`;
						return result;
					}
					break;
				default:
					throw new Error(`Endpoint type ${this.endpoint.type} is not supported.`);
			}
			
			result.isSuccess = true;
			return result;
		}
		
		async runMonitoring() {
			const queueName = this.getQueueName();
			
			await pgBoss.work(queueName, {
				newJobCheckInterval: PG_BOSS_JOB_CHECK_INTERVAL_MS
			}, endpointMonitoringHandler);
			
			await pgBoss.send(queueName, { endpointId: this.id }, {});
		}
	}
	
	Endpoint.init({
		name: DataTypes.STRING,
		chatId: DataTypes.STRING,
		url: DataTypes.STRING,
		type: DataTypes.ENUM(ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL),
		data: DataTypes.JSON,
		httpMethod: DataTypes.ENUM(HTTP_METHOD_GET, HTTP_METHOD_POST),
		restSuccessStatus: DataTypes.INTEGER,
		interval: DataTypes.INTEGER,
		expireAt: DataTypes.DATE,
		lastQueuedAt: DataTypes.DATE
	}, {
		sequelize,
		modelName: MODEL_NAME_ENDPOINT,
		tableName: TABLE_NAME_ENDPOINTS,
		hooks: {
			afterCreate: async endpoint => await endpoint.runMonitoring(),
			afterUpdate: async (endpoint) => {
				if (endpoint.changed('expireAt')) {
					const oldExpireAt = DateTime.fromJSDate(endpoint.previous('expireAt'));
					
					if (oldExpireAt < DateTime.now()) await endpoint.runMonitoring();
				}
			}
		}
	});
	return Endpoint;
};