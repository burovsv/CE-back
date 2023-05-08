module.exports = (sequelize, Sequelize) => {
  const EmployeeHidden = sequelize.define('employeeHidden', {
    employeeId: { type: Sequelize.INTEGER, allowNull: false },
    subdivisionId: { type: Sequelize.INTEGER, allowNull: false },
  });
  return EmployeeHidden;
};
