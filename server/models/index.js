const sequelize = require('../config/database');

const User = require('./User');
const Profile = require('./Profile');
const Attendance = typeof require('./Attendance') === 'function' ? require('./Attendance')(sequelize) : require('./Attendance');
const Leave = typeof require('./Leave') === 'function' ? require('./Leave')(sequelize) : require('./Leave');
const Payroll = typeof require('./Payroll') === 'function' ? require('./Payroll')(sequelize) : require('./Payroll');
const Notification = typeof require('./Notification') === 'function' ? require('./Notification')(sequelize) : require('./Notification');

// Associations
User.hasOne(Profile, { as: 'profile', foreignKey: 'userId' });
Profile.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Attendance, { foreignKey: 'userId', onDelete: 'CASCADE' });
Attendance.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Leave, { foreignKey: 'userId', onDelete: 'CASCADE' });
Leave.belongsTo(User, { foreignKey: 'userId' });
Leave.belongsTo(User, { as: 'Approver', foreignKey: 'approvedBy' });

User.hasMany(Payroll, { foreignKey: 'userId', onDelete: 'CASCADE' });
Payroll.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Profile,
  Attendance,
  Leave,
  Payroll,
  Notification,
};
