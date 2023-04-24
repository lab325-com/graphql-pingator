'use strict';
const {TABLE_NAME_ENDPOINTS} = require("../constants/Table");
const {ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL} = require("../constants/Endpoint");
const {HTTP_METHOD_GET, HTTP_METHOD_POST} = require("../constants/Http");
const ExtendedModel = require("../classes/ExtendedModel");
module.exports = (sequelize, DataTypes) => {
  class Endpoint extends ExtendedModel {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

    }
  }
  Endpoint.init({
    name: DataTypes.STRING,
    chatId: DataTypes.STRING,
    url: DataTypes.STRING,
    type: DataTypes.ENUM(ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL),
    data: DataTypes.JSON,
    httpMethod: DataTypes.ENUM(HTTP_METHOD_GET, HTTP_METHOD_POST),
    restSuccessStatus: DataTypes.INTEGER,
    interval: DataTypes.INTEGER,
    expireAt: DataTypes.DATE,
    lastQueuedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Endpoint',
    tableName: TABLE_NAME_ENDPOINTS
  });
  return Endpoint;
};