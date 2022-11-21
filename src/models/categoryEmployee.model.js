module.exports = (sequelize, Sequelize) => {
  const CategoryEmployee = sequelize.define('categoryEmployee', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return CategoryEmployee;
};
