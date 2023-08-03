module.exports = (sequelize, Sequelize) => {
  const PostSubdivision = sequelize.define('postSubdivision', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    active: { type: Sequelize.Boolean, defaultValue: true, allowNull: false },
    staffCount: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  });
  return PostSubdivision;
};
