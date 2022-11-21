module.exports = (sequelize, Sequelize) => {
  const Subdivision = sequelize.define(
    'subdivision',
    {
      idService: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { createdAt: false, updatedAt: false },
  );
  return Subdivision;
};
