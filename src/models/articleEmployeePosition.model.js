module.exports = (sequelize, Sequelize) => {
  const ArticleEmployeePosition = sequelize.define('articleEmployeePosition', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return ArticleEmployeePosition;
};
