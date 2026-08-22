const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Leave = sequelize.define(
    'Leave',
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
      leaveType: {
        type: DataTypes.ENUM('Paid', 'Sick', 'Unpaid'),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      totalDays: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      halfDay: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      halfDaySession: {
        type: DataTypes.ENUM('Morning', 'Afternoon'),
        allowNull: true,
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending',
      },
      approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      approvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'Leaves',
      timestamps: true,
      validate: {
        endDateAfterStartDate() {
          if (this.startDate && this.endDate) {
            if (new Date(this.endDate) < new Date(this.startDate)) {
              throw new Error('endDate must be greater than or equal to startDate');
            }
          }
        },
        halfDaySessionRequired() {
          if (this.halfDay && !this.halfDaySession) {
            throw new Error('halfDaySession is required when halfDay is true');
          }
        },
      },
      hooks: {
        beforeValidate: (leave) => {
          if (leave.halfDay) {
            leave.totalDays = 0.5;
          } else if (leave.startDate && leave.endDate) {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diffTime = end.getTime() - start.getTime();
            if (!isNaN(diffTime) && diffTime >= 0) {
              const diffDays = Math.round(diffTime / (1000 * 3600 * 24)) + 1;
              leave.totalDays = diffDays;
            }
          }
        },
      },
    }
  );

  return Leave;
};
