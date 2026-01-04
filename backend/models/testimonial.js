'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Testimonial extends Model {
    static associate(models) {
      Testimonial.belongsTo(models.Gallery, {
        foreignKey: 'gallery_id',
        as: 'gallery'
      });
    }
  }
  Testimonial.init({
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 5
      }
    },
    gallery_id: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Testimonial',
  });
  return Testimonial;
};