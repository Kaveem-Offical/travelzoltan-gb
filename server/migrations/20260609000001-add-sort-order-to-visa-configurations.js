'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('VisaConfigurations', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Initialize sort_order based on current alphabetical order so existing rows
    // keep a deterministic starting sequence rather than all being 0.
    const [configs] = await queryInterface.sequelize.query(
      'SELECT id FROM `VisaConfigurations` ORDER BY citizenship ASC, destination ASC'
    );
    for (let i = 0; i < configs.length; i++) {
      await queryInterface.sequelize.query(
        `UPDATE \`VisaConfigurations\` SET sort_order = ${i} WHERE id = ${configs[i].id}`
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('VisaConfigurations', 'sort_order');
  }
};
