module.exports = (sequelize, Sequelize) => {
  const SubdivisionWorkTimeTemplate = sequelize.define(
    'subdivisionWorkTimeTemplate',
    {
      timeStart1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeEnd1: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeStart2: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeEnd2: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeStart3: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeEnd3: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeStart4: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      timeEnd4: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    { createdAt: false, updatedAt: false },
  );
  return SubdivisionWorkTimeTemplate;
};
