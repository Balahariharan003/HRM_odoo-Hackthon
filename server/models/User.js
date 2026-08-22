const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true, // Let it be nullable just in case some Module 3 tests generate users without passwords, but keeps it for normal auth!
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'Employee',
      },
    },
    {
      tableName: 'Users',
      timestamps: true,
    }
  );

  return User;
};
