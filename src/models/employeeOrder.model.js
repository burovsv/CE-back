module.exports = (sequelize, Sequelize) => {
  const EmployeeOrder = sequelize.define('employeeOrder', {
    employeeId: { type: Sequelize.INTEGER, allowNull: false },
    order: { type: Sequelize.INTEGER, allowNull: false },
    subdivisionId: { type: Sequelize.INTEGER, allowNull: false },
  });
  return EmployeeOrder;
};
