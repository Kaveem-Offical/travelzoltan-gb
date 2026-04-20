'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Applications', 'payment_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Razorpay payment ID after successful payment'
    });

    await queryInterface.addColumn('Applications', 'order_id', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Razorpay order ID for payment tracking'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Applications', 'payment_id');
    await queryInterface.removeColumn('Applications', 'order_id');
  }
};
