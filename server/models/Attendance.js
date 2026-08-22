const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Attendance = sequelize.define(
    'Attendance',
    {
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
      checkIn: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      checkOut: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      totalHours: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('Present', 'Absent', 'Half-day', 'Leave'),
        defaultValue: 'Absent',
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'Attendances',
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['userId', 'date'],
          name: 'unique_user_date',
        },
      ],
      hooks: {
        beforeSave: (attendance) => {
          if (attendance.checkIn && attendance.checkOut) {
            const parseTime = (timeStr) => {
              if (typeof timeStr === 'string') {
                const parts = timeStr.split(':').map(Number);
                const hours = parts[0] || 0;
                const minutes = parts[1] || 0;
                const seconds = parts[2] || 0;
                return hours * 60 + minutes + seconds / 60;
              }
              return 0;
            };
            const checkInMins = parseTime(attendance.checkIn);
            const checkOutMins = parseTime(attendance.checkOut);
            let diffMins = checkOutMins - checkInMins;
            if (diffMins < 0) {
              diffMins += 24 * 60;
            }
            attendance.totalHours = parseFloat((diffMins / 60).toFixed(2));
          }
        },
      },
    }
  );

  return Attendance;
};
