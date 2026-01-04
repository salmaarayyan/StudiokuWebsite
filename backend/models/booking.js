'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Layanan, {
        foreignKey: 'layanan_id',
        as: 'layanan'
      });
    }
  }
  Booking.init({
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customer_email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    customer_phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    booking_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    booking_time: {
      type: DataTypes.TIME,
      allowNull: false
    },
    time_slot: {
      type: DataTypes.TIME,
      allowNull: false
    },
    selected_package: {
      type: DataTypes.ENUM('couple', 'group', 'photobox'),
      allowNull: false
    },
    additional_person: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    background_choice: {
      type: DataTypes.STRING
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'qris'),
      allowNull: false
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    layanan_id: {
      type: DataTypes.INTEGER
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
      defaultValue: 'pending'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};