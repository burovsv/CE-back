module.exports = (sequelize, Sequelize) => {
  const AcceptWorkTable = sequelize.define('acceptWorkTable', {
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
    },
    subdivisionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    status: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    directorComment: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    managerComment: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  });
  return AcceptWorkTable;
};
