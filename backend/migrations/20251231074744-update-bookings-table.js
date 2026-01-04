'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Bookings', 'selected_package', {
      type: Sequelize.ENUM('couple', 'group', 'photobox'),
      allowNull: false,
      after: 'layanan_id'
    });

    await queryInterface.addColumn('Bookings', 'time_slot', {
      type: Sequelize.TIME,
      allowNull: false,
      after: 'booking_time'
    });

    await queryInterface.addColumn('Bookings', 'additional_person', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: 'time_slot'
    });

    await queryInterface.addColumn('Bookings', 'background_choice', {
      type: Sequelize.STRING,
      after: 'additional_person'
    });

    await queryInterface.addColumn('Bookings', 'payment_method', {
      type: Sequelize.ENUM('cash', 'qris'),
      allowNull: false,
      after: 'background_choice'
    });

    await queryInterface.addColumn('Bookings', 'total_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      after: 'payment_method'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookings', 'selected_package');
    await queryInterface.removeColumn('Bookings', 'time_slot');
    await queryInterface.removeColumn('Bookings', 'additional_person');
    await queryInterface.removeColumn('Bookings', 'background_choice');
    await queryInterface.removeColumn('Bookings', 'payment_method');
    await queryInterface.removeColumn('Bookings', 'total_price');
  }
};