const ExtendedModel = require('../classes/ExtendedModel.js')

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
        tableName: 'postgress_sessions'
    });

    return Session;
};