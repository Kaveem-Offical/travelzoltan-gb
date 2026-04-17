'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VisaConfiguration extends Model {
    static associate(models) {
      VisaConfiguration.hasMany(models.Application, {
        foreignKey: 'configuration_id',
        as: 'applications'
      });
    }
  }
  VisaConfiguration.init({
    citizenship: {
      type: DataTypes.STRING,
      allowNull: false
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    service_fee: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        admin_fee: 0,
        service_fee: 0,
        express_fee: 0
      }
    },
    required_documents: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [] // Array of { name, description, icon }
    },
    form_schema: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {} // Dynamic form fields required
    }
  }, {
    sequelize,
    modelName: 'VisaConfiguration',
    tableName: 'VisaConfigurations',
    indexes: [
      {
        unique: true,
        fields: ['citizenship', 'destination']
      }
    ]
  });
  return VisaConfiguration;
};
