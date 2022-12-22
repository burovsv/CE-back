module.exports = (sequelize, Sequelize) => {
    const EmployeePosition = sequelize.define('employeePosition', {
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
    return EmployeePosition;
}