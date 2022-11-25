module.exports = (sequelize, Sequelize) => {
  const EmployeeWorkCalendar = sequelize.define('employeeWorkCalendar', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return EmployeeWorkCalendar;
};
