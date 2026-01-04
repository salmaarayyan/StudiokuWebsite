'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Layanans');
    if (tableDescription.background_image) {
      await queryInterface.removeColumn('Layanans', 'background_image');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Layanans');
    if (!tableDescription.background_image) {
      await queryInterface.addColumn('Layanans', 'background_image', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  }
};