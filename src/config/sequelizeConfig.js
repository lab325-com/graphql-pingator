import { config } from 'dotenv';
import { POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_USER } from '@config/env';

config();

const sequelizeConfig = {
	username: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	database: POSTGRES_DB,
	host: POSTGRES_HOST,
	dialect: 'postgres',
	port: POSTGRES_PORT
};

module.exports = {
	local: sequelizeConfig,
	development: sequelizeConfig,
	production: sequelizeConfig
};