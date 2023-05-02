module.exports = {
	up: async (queryInterface) => {
		await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
	},
	
	down: async (queryInterface) => {
		await queryInterface.sequelize.query('DROP EXTENSION "uuid-ossp";');
	}
};
