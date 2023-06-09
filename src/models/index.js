import log from '@lib/log';
import path from 'path';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import configs from '@config/sequelizeConfig';

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'local';
const db = {};
const config = configs[env];

config.logging = message => log.log('query', message);

log.info('Sequelize is connecting...');

const sequelize = config.use_env_variable
	? new Sequelize(process.env[config.use_env_variable], config)
	: new Sequelize(config.database, config.username, config.password, config);

sequelize.authenticate()
	.then(() => log.info(`Sequelize is connected to db ${config.database}`))
	.catch(err => log.error('Error occurred while connecting to db', err));

log.info('Models are loading...');

fs
	.readdirSync(__dirname)
	.filter(file => {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(file => {
		const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
		db[model.name] = model;
	});

Object.keys(db).forEach(modelName => {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

log.info('Models are loaded');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;