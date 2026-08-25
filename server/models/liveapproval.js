'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LiveApproval extends Model {
    static associate(models) {
      // No required foreign keys, stand-alone trust record
    }
  }

  LiveApproval.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'India'
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false
    },
    flag: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '✈️'
    },
    visa_type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Tourist Visa'
    },
    time_ago: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Just now'
    },
    processing_time: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Fast-Track Approved'
    },
    avatar_text: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'ZV'
    },
    avatar_bg: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'LiveApproval',
    tableName: 'LiveApprovals',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return LiveApproval;
};
