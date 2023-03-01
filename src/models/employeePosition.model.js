module.exports = (sequelize, Sequelize) => {
    const EmployeePosition = sequelize.define('employeePosition', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
    });
    return EmployeePosition;
}