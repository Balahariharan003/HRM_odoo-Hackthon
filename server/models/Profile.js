const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Profile = sequelize.define(
    'Profile',
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
      employeeId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      designation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'Profiles',
      timestamps: true,
    }
  );

  return Profile;
};
