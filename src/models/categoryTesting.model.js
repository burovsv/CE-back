module.exports = (sequelize, Sequelize) => {
  const CategoryTesting = sequelize.define('categoryTesting', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return CategoryTesting;
};
