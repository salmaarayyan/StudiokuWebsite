'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminBlock extends Model {
    static associate(models) {
      // No associations
    }
  }
  AdminBlock.init({
    block_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      defaultValue: 'istirahat'
    }
  }, {
    sequelize,
    modelName: 'AdminBlock',
  });
  return AdminBlock;
};