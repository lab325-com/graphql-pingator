'use strict';
const {
  Model
} = require('sequelize');
const {TABLE_NAME_JOBS} = require("../constants/Table");
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Job.hasMany(models.Endpoint, { foreignKey: 'jobId' })
    }
  }
  Job.init({
    interval: DataTypes.INTEGER,
    showOkResult: DataTypes.BOOLEAN,
    showElapsedTime: DataTypes.BOOLEAN,
    running: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Job',
    tableName: TABLE_NAME_JOBS
  });
  return Job;
};