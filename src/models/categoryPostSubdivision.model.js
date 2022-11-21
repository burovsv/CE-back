module.exports = (sequelize, Sequelize) => {
  const CategoryPostSubdivision = sequelize.define('categoryPostSubdivision', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return CategoryPostSubdivision;
};
