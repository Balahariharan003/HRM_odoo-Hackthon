const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payroll = sequelize.define('Payroll', {
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
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Month must be between 1 and 12',
        },
        max: {
          args: [12],
          msg: 'Month must be between 1 and 12',
        },
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    basic: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    hra: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    allowances: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    grossSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    pf: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    insurance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    otherDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    totalDeductions: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    netSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paymentStatus: {
      type: DataTypes.ENUM('Pending', 'Processed', 'Failed'),
      defaultValue: 'Pending',
    },
    paymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'Payrolls',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'month', 'year'],
        name: 'unique_user_month_year',
      },
    ],
    hooks: {
      beforeValidate: (payroll) => {
        const basic = parseFloat(payroll.basic || 0);
        const hra = parseFloat(payroll.hra || 0);
        const allowances = parseFloat(payroll.allowances || 0);
        const tax = parseFloat(payroll.tax || 0);
        const pf = parseFloat(payroll.pf || 0);
        const insurance = parseFloat(payroll.insurance || 0);
        const otherDeductions = parseFloat(payroll.otherDeductions || 0);

        if (payroll.grossSalary === undefined || payroll.grossSalary === null || parseFloat(payroll.grossSalary) === 0) {
          payroll.grossSalary = parseFloat((basic + hra + allowances).toFixed(2));
        }
        if (payroll.totalDeductions === undefined || payroll.totalDeductions === null || parseFloat(payroll.totalDeductions) === 0) {
          payroll.totalDeductions = parseFloat((tax + pf + insurance + otherDeductions).toFixed(2));
        }
        if (payroll.netSalary === undefined || payroll.netSalary === null || parseFloat(payroll.netSalary) === 0) {
          payroll.netSalary = parseFloat((parseFloat(payroll.grossSalary) - parseFloat(payroll.totalDeductions)).toFixed(2));
        }
      },
    },
    validate: {
      validateGrossSalary() {
        const basic = parseFloat(this.basic || 0);
        const hra = parseFloat(this.hra || 0);
        const allowances = parseFloat(this.allowances || 0);
        const grossSalary = parseFloat(this.grossSalary || 0);
        const expectedGross = parseFloat((basic + hra + allowances).toFixed(2));
        if (Math.abs(grossSalary - expectedGross) > 0.01) {
          throw new Error('grossSalary must equal basic + hra + allowances');
        }
      },
      validateTotalDeductions() {
        const tax = parseFloat(this.tax || 0);
        const pf = parseFloat(this.pf || 0);
        const insurance = parseFloat(this.insurance || 0);
        const otherDeductions = parseFloat(this.otherDeductions || 0);
        const totalDeductions = parseFloat(this.totalDeductions || 0);
        const expectedTotalDeductions = parseFloat((tax + pf + insurance + otherDeductions).toFixed(2));
        if (Math.abs(totalDeductions - expectedTotalDeductions) > 0.01) {
          throw new Error('totalDeductions must equal tax + pf + insurance + otherDeductions');
        }
      },
      validateNetSalary() {
        const grossSalary = parseFloat(this.grossSalary || 0);
        const totalDeductions = parseFloat(this.totalDeductions || 0);
        const netSalary = parseFloat(this.netSalary || 0);
        const expectedNet = parseFloat((grossSalary - totalDeductions).toFixed(2));
        if (Math.abs(netSalary - expectedNet) > 0.01) {
          throw new Error('netSalary must equal grossSalary - totalDeductions');
        }
      },
    },
  });

  return Payroll;
};
