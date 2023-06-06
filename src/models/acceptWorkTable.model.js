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
    accept: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
  return AcceptWorkTable;
};
