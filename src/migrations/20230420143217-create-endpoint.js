import { HTTP_METHOD_GET, HTTP_METHOD_POST } from '@constants/Http';
import { ENDPOINT_TYPE_GRAPHQL, ENDPOINT_TYPE_REST } from '@constants/Endpoint';
import { TABLE_NAME_ENDPOINTS } from '@constants/Table';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable(TABLE_NAME_ENDPOINTS, {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.literal('uuid_generate_v4()'),
				allowNull: false,
				primaryKey: true
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false
			},
			chatId: {
				type: Sequelize.STRING,
				allowNull: false
			},
			url: {
				type: Sequelize.STRING,
				allowNull: false
			},
			type: {
				type: Sequelize.ENUM(ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL),
				allowNull: false
			},
			data: {
				type: Sequelize.JSONB
			},
			httpMethod: {
				type: Sequelize.ENUM(HTTP_METHOD_GET, HTTP_METHOD_POST)
			},
			restSuccessStatus: {
				type: Sequelize.INTEGER
			},
			interval: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			expireAt: {
				allowNull: true,
				type: 'TIMESTAMP'
			},
			lastQueuedAt: {
				allowNull: true,
				type: 'TIMESTAMP'
			},
			createdAt: {
				allowNull: false,
				type: 'TIMESTAMP',
				defaultValue: Sequelize.literal('NOW()')
			},
			updatedAt: {
				allowNull: false,
				type: 'TIMESTAMP',
				defaultValue: Sequelize.literal('NOW()')
			}
		});
	},
	down: async queryInterface => await queryInterface.dropTable(TABLE_NAME_ENDPOINTS)
};