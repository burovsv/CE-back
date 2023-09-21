module.exports = (sequelize, Sequelize) => {
    const Mark = sequelize.define('mark', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
    return Mark;
}