'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Layanans');
    
    if (!tableDescription.duration) {
      await queryInterface.addColumn('Layanans', 'duration', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    
    if (!tableDescription.max_person) {
      await queryInterface.addColumn('Layanans', 'max_person', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    
    if (!tableDescription.min_person) {
      await queryInterface.addColumn('Layanans', 'min_person', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Layanans');
    
    if (tableDescription.min_person) {
      await queryInterface.removeColumn('Layanans', 'min_person');
    }
    
    if (tableDescription.max_person) {
      await queryInterface.removeColumn('Layanans', 'max_person');
    }
    
    if (tableDescription.duration) {
      await queryInterface.removeColumn('Layanans', 'duration');
    }
  }
};