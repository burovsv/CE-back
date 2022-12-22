const db = require('../models');
const jwt = require('jsonwebtoken');

const { CustomError, TypeError } = require('../models/customError.model');
const EmployeePosition = db.employeePositions;


class EmployeePositionController { 
    async getEmployeePositions(req, res) {
        const employees = await axios.get(`http://${process.env.API_1C_USER}:${process.env.API_1C_PASSWORD}@192.168.240.196/zup_pay/hs/Exch_LP/ListEmployees`);

        res.json(employees)
    }

}

module.exports = new EmployeePositionController();