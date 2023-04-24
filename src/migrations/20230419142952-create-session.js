'use strict';
const {TABLE_NAME_SESSIONS} = require("../constants/Table");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME_SESSIONS, {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      session: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(TABLE_NAME_SESSIONS);
  }
};