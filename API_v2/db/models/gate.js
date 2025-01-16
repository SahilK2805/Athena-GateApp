'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gate extends Model {
    static associate(models) {
      Gate.belongsToMany(models.User, { through: models.Shared, foreignKey: 'gateId' });
      // Gate.hasMany(models.Shared,{foreignKey: 'gateId'}); // Admin relationship
    }
  };
  Gate.init({
    name: DataTypes.STRING,
    status: DataTypes.ENUM('0','1','2'),
    subscription: DataTypes.STRING,
    locked: DataTypes.BOOLEAN,
    locationLat: DataTypes.FLOAT,
    locationLon: DataTypes.FLOAT,
    geolocked: DataTypes.BOOLEAN,
    deletedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Gate',
    paranoid: true,  // Enable soft deletes
  });
  return Gate;
};
