module.exports = (sequelize, Sequelize) => {
  const NewsType = sequelize.define('newsType', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return NewsType;
};
