import { config } from 'dotenv';

config();

import {
	POSTGRES_PASSWORD,
	POSTGRES_USER,
	POSTGRES_DB,
	POSTGRES_HOST,
	POSTGRES_PORT
} from '@config/env';

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