'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Gallery extends Model {
    static associate(models) {
      Gallery.hasMany(models.Testimonial, {
        foreignKey: 'gallery_id',
        as: 'testimonials'
      });
    }
  }
  Gallery.init({
    image_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    caption: {
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'Gallery',
  });
  return Gallery;
};