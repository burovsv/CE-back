module.exports = (sequelize, Sequelize) => {
  const NewsFilter = sequelize.define('newsFilter', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return NewsFilter;
};
