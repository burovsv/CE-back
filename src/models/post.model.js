module.exports = (sequelize, Sequelize) => {
  const Post = sequelize.define('post', {
    idService: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Post;
};
