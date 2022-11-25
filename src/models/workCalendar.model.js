module.exports = (sequelize, Sequelize) => {
  const WorkCalendar = sequelize.define('workCalendar', {
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    calendarData: {
      type: Sequelize.TEXT('long'),
      allowNull: false,
    },
  });
  return WorkCalendar;
};
