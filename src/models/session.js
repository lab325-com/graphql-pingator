const ExtendedModel = require('../classes/ExtendedModel')
const {TABLE_NAME_SESSIONS} = require("../constants/Table");

module.exports = (sequelize, DataTypes) => {
    class Session extends ExtendedModel {
        /*static associate(models) {

        }*/
    }

    Session.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        session: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'Session',
        tableName: TABLE_NAME_SESSIONS
    });

    return Session;
};