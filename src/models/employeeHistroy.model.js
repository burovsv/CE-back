module.exports = (sequelize, Sequelize) => {
  const EmployeeHistory = sequelize.define('employeeHistory', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeExternalId: { type: Sequelize.STRING, allowNull: false },
    dateIn: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    dateOut: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
  });
  return EmployeeHistory;
};
