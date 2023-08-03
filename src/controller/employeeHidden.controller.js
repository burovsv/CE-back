const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const EmployeeHidden = db.employeeHidden;
class EmployeeHiddenController {
  async getEmployeeHiddenList(req, res) {
    const { subdivisionId } = req.query;
    const findEmployeeHidden = await EmployeeHidden.findAll({
      where: {
        subdivisionId,
      },
    });
    res.json(findEmployeeHidden);
  }
}

module.exports = new EmployeeHiddenController();
