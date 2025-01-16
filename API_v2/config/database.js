const { Sequelize } = require('sequelize');

const env = 'development';
const config = require('./config');

const sequelize = new Sequelize(config[env]);

module.exports = sequelize;
