module.exports = (sequelize, Sequelize) => {
    const Article = sequelize.define('article', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        content: {
            type: Sequelize.TEXT('long'),
            allowNull: false,
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false,
        },
        active: { 
            type: Sequelize.Boolean, 
            defaultValue: true,
            allowNull: false },
    });
    return Article;
}