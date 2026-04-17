'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Change service_fee from DECIMAL to JSON
    await queryInterface.changeColumn('VisaConfigurations', 'service_fee', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {
        admin_fee: 0,
        service_fee: 0,
        express_fee: 0
      }
    });

    // Migrate existing data - convert single fee value to breakdown
    const configs = await queryInterface.sequelize.query(
      'SELECT id, service_fee FROM VisaConfigurations',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const config of configs) {
      let feeBreakdown;
      
      // If already an object, keep it
      if (typeof config.service_fee === 'object' && config.service_fee !== null) {
        feeBreakdown = config.service_fee;
      } else {
        // Convert single fee to breakdown
        const totalFee = parseFloat(config.service_fee) || 0;
        feeBreakdown = {
          admin_fee: parseFloat((totalFee * 0.2).toFixed(2)),
          service_fee: parseFloat((totalFee * 0.6).toFixed(2)),
          express_fee: parseFloat((totalFee * 0.2).toFixed(2))
        };
      }

      await queryInterface.sequelize.query(
        'UPDATE VisaConfigurations SET service_fee = ? WHERE id = ?',
        {
          replacements: [JSON.stringify(feeBreakdown), config.id],
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Migrate required_documents from array of strings to array of objects
    const docs = await queryInterface.sequelize.query(
      'SELECT id, required_documents FROM VisaConfigurations',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const config of docs) {
      let documents = config.required_documents;
      
      if (typeof documents === 'string') {
        try {
          documents = JSON.parse(documents);
        } catch (e) {
          documents = [];
        }
      }

      if (Array.isArray(documents)) {
        const newDocs = documents.map(doc => {
          // If already an object with name, keep it
          if (typeof doc === 'object' && doc.name) {
            return doc;
          }
          // Convert string to object
          return {
            name: doc,
            description: '',
            icon: 'description'
          };
        });

        await queryInterface.sequelize.query(
          'UPDATE VisaConfigurations SET required_documents = ? WHERE id = ?',
          {
            replacements: [JSON.stringify(newDocs), config.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Revert service_fee back to DECIMAL
    await queryInterface.changeColumn('VisaConfigurations', 'service_fee', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    });

    // Convert back to single fee (sum of all fees)
    const configs = await queryInterface.sequelize.query(
      'SELECT id, service_fee FROM VisaConfigurations',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const config of configs) {
      let totalFee = 0;
      
      if (typeof config.service_fee === 'object' && config.service_fee !== null) {
        totalFee = (config.service_fee.admin_fee || 0) + 
                   (config.service_fee.service_fee || 0) + 
                   (config.service_fee.express_fee || 0);
      } else {
        totalFee = parseFloat(config.service_fee) || 0;
      }

      await queryInterface.sequelize.query(
        'UPDATE VisaConfigurations SET service_fee = ? WHERE id = ?',
        {
          replacements: [totalFee, config.id],
          type: queryInterface.sequelize.QueryTypes.UPDATE
        }
      );
    }

    // Convert documents back to strings
    const docs = await queryInterface.sequelize.query(
      'SELECT id, required_documents FROM VisaConfigurations',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    for (const config of docs) {
      let documents = config.required_documents;
      
      if (typeof documents === 'string') {
        try {
          documents = JSON.parse(documents);
        } catch (e) {
          documents = [];
        }
      }

      if (Array.isArray(documents)) {
        const newDocs = documents.map(doc => {
          if (typeof doc === 'object' && doc.name) {
            return doc.name;
          }
          return doc;
        });

        await queryInterface.sequelize.query(
          'UPDATE VisaConfigurations SET required_documents = ? WHERE id = ?',
          {
            replacements: [JSON.stringify(newDocs), config.id],
            type: queryInterface.sequelize.QueryTypes.UPDATE
          }
        );
      }
    }
  }
};
