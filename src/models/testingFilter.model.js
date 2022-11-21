module.exports = (sequelize, Sequelize) => {
  const TestingFilter = sequelize.define('testingFilter', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return TestingFilter;
};
