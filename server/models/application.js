'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.VisaConfiguration, {
        foreignKey: 'configuration_id',
        as: 'visaConfiguration'
      });
      Application.hasMany(models.Document, {
        foreignKey: 'application_id',
        as: 'documents'
      });
    }
  }
  Application.init({
    configuration_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'VisaConfigurations',
        key: 'id'
      }
    },
    user_data: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {} // Dynamic form answers
    },
    document_urls: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [] // Array of file paths/URLs
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Application',
    tableName: 'Applications',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Application;
};
