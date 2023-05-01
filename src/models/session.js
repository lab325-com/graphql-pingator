import ExtendedModel from '@classes/ExtendedModel';
import { TABLE_NAME_SESSIONS } from '@constants/Table';

module.exports = (sequelize, DataTypes) => {
	class Session extends ExtendedModel {
	
	}
	
	Session.init({
		session: DataTypes.TEXT
	}, {
		sequelize,
		modelName: 'Session',
		tableName: TABLE_NAME_SESSIONS
	});
	
	return Session;
};