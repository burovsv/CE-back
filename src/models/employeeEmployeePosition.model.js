module.exports = (sequelize, Sequelize) => {
  const EmployeeEmployeePosition = sequelize.define('employeeEmployeePosition', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return EmployeeEmployeePosition;
};
