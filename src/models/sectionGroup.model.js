module.exports = (sequelize, Sequelize) => {
    const SectionGroup = sequelize.define('sectionGroup', {
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
    return SectionGroup;
}