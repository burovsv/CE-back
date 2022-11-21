module.exports = (sequelize, Sequelize) => {
  const NewsCategory = sequelize.define('newsCategory', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return NewsCategory;
};
