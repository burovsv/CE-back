module.exports = (sequelize, Sequelize) => {
  const Testing = sequelize.define('testing', {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    desc: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    dateStart: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    dateEnd: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    linkTest: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  });
  return Testing;
};
