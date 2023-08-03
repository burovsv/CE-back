module.exports = (sequelize, Sequelize) => {
  const PrePaymentEmployee = sequelize.define('prePaymentEmployee', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    sum: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    subdivisionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
  });
  return PrePaymentEmployee;
};
