const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./database');
const User = require('../db/models/user')(sequelize, DataTypes);
const Gate = require('../db/models/gate')(sequelize, DataTypes);
const Shared= require('../db/models/shared')(sequelize, DataTypes);

User.associate({ Gate, Shared });
Gate.associate({ User, Shared });
Shared.associate({ User, Gate });

sequelize.sync(); // Ensure the models are synced

module.exports = {
  sequelize,
  User,
    Gate,
    Shared
};