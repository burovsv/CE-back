const db = require('../models');
const jwt = require('jsonwebtoken');
const { default: axios } = require('axios');


const { CustomError, TypeError } = require('../models/customError.model');
const EmployeePosition = db.employeePositions;


class EmployeePositionController {

    async getEmployeePositions(req, res) {
        const dataFrom1C = await axios
            .get(`http://${process.env.API_1C_USER}:${process.env.API_1C_PASSWORD}@192.168.240.196/zup_pay/hs/Exch_LP/ListPost`, {})
            .then((res) => {
                return res.data;
            })
            .catch((res) => {
                console.log('error', res.response.data);
                return [];
            })

        res.json(dataFrom1C)
    }

}

module.exports = new EmployeePositionController();