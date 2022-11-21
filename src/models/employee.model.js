module.exports = (sequelize, Sequelize) => {
  const Employee = sequelize.define('employee', {
    idService: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    patronymicName: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tel: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    role: { type: Sequelize.STRING, allowNull: false, defaultValue: 'user' },
    coefficient: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });
  return Employee;
};
