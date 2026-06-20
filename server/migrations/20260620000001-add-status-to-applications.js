'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Applications', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Documents Pending'
    });

    // Populate existing applications' statuses based on their payment_status
    await queryInterface.sequelize.query(
      `UPDATE Applications SET status = 'Process Completed' WHERE payment_status = 'completed'`
    );
    await queryInterface.sequelize.query(
      `UPDATE Applications SET status = 'Rejected' WHERE payment_status = 'failed'`
    );
    await queryInterface.sequelize.query(
      `UPDATE Applications SET status = 'Payment Pending' WHERE payment_status = 'pending'`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Applications', 'status');
  }
};
