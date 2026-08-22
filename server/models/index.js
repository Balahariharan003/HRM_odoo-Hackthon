const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = process.env.DATABASE_URL
  ? null
  : (process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'));

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
const Payroll = require('./Payroll')(sequelize);
const Notification = require('./Notification')(sequelize);
const Attendance = require('./Attendance')(sequelize);
const Leave = require('./Leave')(sequelize);

// Associations
User.hasOne(Profile, { foreignKey: 'userId', onDelete: 'CASCADE' });
Profile.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(Payroll, { foreignKey: 'userId', onDelete: 'CASCADE' });
Payroll.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(Attendance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(Leave, { foreignKey: 'userId', onDelete: 'CASCADE' });
Leave.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
Leave.belongsTo(User, { as: 'Approver', foreignKey: 'approvedBy' });

const db = {
  sequelize,
  Sequelize,
  User,
  Profile,
  Payroll,
  Notification,
  Attendance,
  Leave,
};

module.exports = db;
