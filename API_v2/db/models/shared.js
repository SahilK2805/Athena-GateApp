'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shared extends Model {
    static associate(models) {
      Shared.belongsTo(models.User, { foreignKey: 'userId' });
      Shared.belongsTo(models.Gate, { foreignKey: 'gateId' });
    }
  };
  Shared.init({
    userId: DataTypes.INTEGER,
    gateId: DataTypes.INTEGER,
    adminid: DataTypes.INTEGER,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Shared',
    paranoid: true,  // Enable soft deletes
  });
  return Shared;
};
