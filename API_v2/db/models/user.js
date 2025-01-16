'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Gate, { through:models.Shared, foreignKey: 'userId' });
      // User.hasMany(models.Shared, { foreignKey: 'adminId' }); // Admin relationship
    }
  };
  User.init({
    name: DataTypes.STRING,
    userType: DataTypes.ENUM('0','1','2'),
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    deletedAt: DataTypes.DATE,
    confirmPassword: {
      type: DataTypes.VIRTUAL,
      set(value) {
          if (this.password.length < 7) {
              throw new AppError(
                  'Password length must be grater than 7',
                  400
              );
          }
          if (value === this.password) {
              const hashPassword = bcrypt.hashSync(value, 10);
              this.setDataValue('password', hashPassword);
          } else {
              throw new AppError(
                  'Password and confirm password must be the same',
                  400
              );
          }
      },
  },
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true,  // Enable soft deletes
  });
  return User;
};
