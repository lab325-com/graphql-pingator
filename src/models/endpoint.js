import { TABLE_NAME_ENDPOINTS } from '@constants/Table';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import { HTTP_METHOD_GET, HTTP_METHOD_POST } from '@constants/Http';
import ExtendedModel from '@classes/ExtendedModel';

module.exports = (sequelize, DataTypes) => {
	class Endpoint extends ExtendedModel {
	
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
		modelName: 'Endpoint',
		tableName: TABLE_NAME_ENDPOINTS
	});
	return Endpoint;
};