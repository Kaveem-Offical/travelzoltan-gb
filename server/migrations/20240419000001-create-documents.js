'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Documents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Applications',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      document_type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Type of document (e.g., passport, photo, bank_statement)'
      },
      file_url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'URL or path to the document'
      },
      storage_type: {
        type: Sequelize.ENUM('drive', 'cloudinary', 'local'),
        allowNull: false,
        defaultValue: 'local',
        comment: 'Storage provider used'
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Original file name'
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'MIME type of the file'
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'File size in bytes'
      },
      drive_file_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Google Drive file ID if stored on Drive'
      },
      cloudinary_public_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Cloudinary public ID if stored on Cloudinary'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add index for faster lookups
    await queryInterface.addIndex('Documents', ['application_id']);
    await queryInterface.addIndex('Documents', ['document_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Documents');
  }
};
