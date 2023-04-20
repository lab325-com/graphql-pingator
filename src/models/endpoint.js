'use strict';
const {
  Model
} = require('sequelize');
const {TABLE_NAME_ENDPOINTS} = require("../constants/Table");
module.exports = (sequelize, DataTypes) => {
  class Endpoint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Endpoint.belongsTo(models.Job, { foreignKey: 'jobId' })
    }
  }
  Endpoint.init({
    jobId: DataTypes.STRING,
    url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Endpoint',
    tableName: TABLE_NAME_ENDPOINTS
  });
  return Endpoint;
};