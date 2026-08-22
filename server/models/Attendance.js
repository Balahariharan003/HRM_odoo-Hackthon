const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define('Attendance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Present', 'Absent', 'HalfDay', 'Leave'),
      allowNull: false,
      defaultValue: 'Present',
    },
    checkIn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    checkOut: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'Attendances',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'date'],
        name: 'unique_user_attendance_date',
      },
    ],
  });

  return Attendance;
};
