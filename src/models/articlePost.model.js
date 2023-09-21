module.exports = (sequelize, Sequelize) => {
  const ArticlePost = sequelize.define('articlePost', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return ArticlePost;
};
