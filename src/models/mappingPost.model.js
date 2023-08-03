module.exports = (sequelize, Sequelize) => {
  const MappingPost = sequelize.define('mappingPost', {
    mappingPosts: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return MappingPost;
};
