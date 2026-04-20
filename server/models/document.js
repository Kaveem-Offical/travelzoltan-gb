'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      Document.belongsTo(models.Application, {
        foreignKey: 'application_id',
        as: 'application'
      });
    }
  }
  
  Document.init({
    application_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Applications',
        key: 'id'
      }
    },
    document_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    storage_type: {
      type: DataTypes.ENUM('drive', 'cloudinary', 'local'),
      allowNull: false,
      defaultValue: 'local'
    },
    file_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    drive_file_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cloudinary_public_id: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Document',
    tableName: 'Documents',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return Document;
};
