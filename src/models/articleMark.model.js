module.exports = (sequelize, Sequelize) => {
  const ArticleMark = sequelize.define('articleMark', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return ArticleMark;
};
