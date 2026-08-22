const sequelize = require('../config/database');
const User = require('./User');
const Profile = require('./Profile');

// Setup Associations
User.hasOne(Profile, {
  foreignKey: 'userId',
  as: 'profile',
  onDelete: 'CASCADE',
});

Profile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  sequelize,
  User,
  Profile,
};
