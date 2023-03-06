module.exports = (sequelize, Sequelize) => {
    const ArticleFile = sequelize.define('articleFile', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        url: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        active: { 
            type: Sequelize.Boolean, 
            defaultValue: true,
            allowNull: false },
    });
    return ArticleFile;
}