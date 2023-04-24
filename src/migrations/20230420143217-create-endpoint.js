'use strict';
const {TABLE_NAME_ENDPOINTS} = require("../constants/Table");
const {ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL} = require("../constants/Endpoint");
const {HTTP_METHOD_GET, HTTP_METHOD_POST} = require("../constants/Http");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME_ENDPOINTS, {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chatId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(ENDPOINT_TYPE_REST, ENDPOINT_TYPE_GRAPHQL),
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true
      },
      httpMethod: {
        type: Sequelize.ENUM(HTTP_METHOD_GET, HTTP_METHOD_POST),
        allowNull: false,
      },
      restSuccessStatus: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      expireAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      lastQueuedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(TABLE_NAME_ENDPOINTS);
  }
};