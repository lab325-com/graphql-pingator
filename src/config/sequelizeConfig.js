import dotenv from 'dotenv';

dotenv.config();

import {
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB,
	POSTGRES_HOST,
	POSTGRES_PORT
} from '@config/env';

const config = {
	username: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	database: POSTGRES_DB,
	host: POSTGRES_HOST,
	port: POSTGRES_PORT,
	dialect: 'postgres'
};

module.exports = {
	local: config,
	development: config,
	production: config
};
