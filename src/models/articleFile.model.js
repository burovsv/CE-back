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
        type: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        isMain: {
            type: Sequelize.BOOLEAN, 
            defaultValue: false,
            allowNull: false,
        },
        description: {
            type: Sequelize.TEXT('long'),
        },
        active: { 
            type: Sequelize.Boolean, 
            defaultValue: true,
            allowNull: false 
        },
    });
    return ArticleFile;
}