import ExtendedModel from '@classes/ExtendedModel';
import { TABLE_NAME_SESSIONS } from '@constants/Table';
import { MODEL_NAME_SESSION } from '@constants/Model';

module.exports = (sequelize, DataTypes) => {
	class Session extends ExtendedModel {
	
	}
	
	Session.init({
		session: DataTypes.TEXT
	}, {
		sequelize,
		modelName: MODEL_NAME_SESSION,
		tableName: TABLE_NAME_SESSIONS
	});
	
	return Session;
};