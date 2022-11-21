module.exports = (sequelize, Sequelize) => {
  const PostSubdivision = sequelize.define('postSubdivision', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
  });
  return PostSubdivision;
};
