module.exports = (sequelize, Sequelize) => {
  const AccessBalanceEmployee = sequelize.define('accessBalanceEmployee', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  });
  return AccessBalanceEmployee;
};
