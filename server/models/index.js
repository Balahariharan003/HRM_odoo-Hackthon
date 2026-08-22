const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_STORAGE || path.join(__dirname, '../database.sqlite'),
  logging: false,
});

const createUserModel = require('./User');
const createProfileModel = require('./Profile');
const createPayrollModel = require('./Payroll');
const createNotificationModel = require('./Notification');
const createAttendanceModel = require('./Attendance');
const createLeaveModel = require('./Leave');

const User = createUserModel(sequelize);
const Profile = createProfileModel(sequelize);
const Payroll = createPayrollModel(sequelize);
const Notification = createNotificationModel(sequelize);
const Attendance = createAttendanceModel(sequelize);
const Leave = createLeaveModel(sequelize);

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
