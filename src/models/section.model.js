module.exports = (sequelize, Sequelize) => {
    const Section = sequelize.define('section', {
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
    return Section;
}