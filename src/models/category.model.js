module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define('category', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Category;
};
