import { TABLE_NAME_SESSIONS } from '@constants/Table';

module.exports = {
	up: async (queryInterface, Sequelize) =>
		await queryInterface.createTable(TABLE_NAME_SESSIONS, {
			id: {
				type: Sequelize.STRING,
				primaryKey: true,
				allowNull: false
			},
			session: {
				type: Sequelize.TEXT,
				allowNull: false
			}
		}),
	down: async queryInterface => await queryInterface.dropTable(TABLE_NAME_SESSIONS)
};