'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Layanan extends Model {
    static associate(models) {
      Layanan.hasMany(models.Booking, {
        foreignKey: 'layanan_id',
        as: 'bookings'
      });
    }
  }
  Layanan.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER
    },
    max_person: {
      type: DataTypes.INTEGER
    },
    min_person: {
      type: DataTypes.INTEGER
    },
    pricing_type: {
      type: DataTypes.ENUM('per_session', 'per_person'),
      defaultValue: 'per_session',
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Layanan',
  });
  return Layanan;
};