const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = process.env.DATABASE_URL
  ? null
  : path.join(__dirname, '../database.sqlite');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: false,
    });

// Initialize models
const User = require('./User')(sequelize);
const Profile = require('./Profile')(sequelize);
const Attendance = require('./Attendance')(sequelize);
const Leave = require('./Leave')(sequelize);

// Associations
User.hasOne(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Attendance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Leave, { foreignKey: 'userId', onDelete: 'CASCADE' });
Leave.belongsTo(User, { foreignKey: 'userId' });
Leave.belongsTo(User, { as: 'Approver', foreignKey: 'approvedBy' });

const db = {
  sequelize,
  Sequelize,
  User,
  Profile,
  Attendance,
  Leave,
};

module.exports = db;
