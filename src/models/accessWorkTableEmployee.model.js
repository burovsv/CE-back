module.exports = (sequelize, Sequelize) => {
  const AccessWorkTableEmployee = sequelize.define('accessWorkTableEmployee', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  return AccessWorkTableEmployee;
};
