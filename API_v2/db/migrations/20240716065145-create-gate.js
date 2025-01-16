'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Gates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      subscription: {
        type: Sequelize.STRING,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('0','1','2'),
        defaultValue: '0'
      },
      locked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      locationLat: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      locationLon: {
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      geolocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Gates');
  }
};