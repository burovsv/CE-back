module.exports = (sequelize, Sequelize) => {
  const SettingPrePayment = sequelize.define(
    'settingPrePayment',
    {
      startDate: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    },
    { createdAt: false, updatedAt: false },
  );
  return SettingPrePayment;
};
