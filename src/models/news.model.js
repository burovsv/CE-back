module.exports = (sequelize, Sequelize) => {
  const News = sequelize.define('news', {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    desc: {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    },
    descShort: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    datePublish: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    dateStart: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    dateEnd: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });
  return News;
};
