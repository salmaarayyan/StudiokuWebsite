'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Layanans', 'pricing_type', {
      type: Sequelize.ENUM('per_session', 'per_person'),
      defaultValue: 'per_session',
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Layanans', 'pricing_type');
  }
};