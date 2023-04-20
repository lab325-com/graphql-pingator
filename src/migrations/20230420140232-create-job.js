'use strict';
const {TABLE_NAME_JOBS} = require("../constants/Table");
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(TABLE_NAME_JOBS, {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      showOkResult: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      showElapsedTime: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      running: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    await queryInterface.dropTable(TABLE_NAME_JOBS);
  }
};