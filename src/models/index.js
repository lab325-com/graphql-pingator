const log = require("../lib/log");
const path = require("path");
const {Sequelize} = require("sequelize");
const fs = require("fs");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'local';
const db = {};
const config = require('../config/sequelizeConfig')[env];

config.logging = message => log.log('query', message);

log.info('Sequelize connecting...');

const sequelize = config.use_env_variable
    ? new Sequelize(process.env[config.use_env_variable], config)
    : new Sequelize(config.database, config.username, config.password, config);

sequelize.authenticate()
    .then(() => log.info(`Sequelize connected to db ${config.database}`))
    .catch(err => console.error('Connecting error', err));

log.info('Models loading...');

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
log.info('Models loaded');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;