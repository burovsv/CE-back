module.exports = (sequelize, Sequelize) => {
  const NewsPost = sequelize.define('newsPost', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return NewsPost;
};
