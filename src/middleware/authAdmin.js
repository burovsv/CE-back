require('dotenv').config();
const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const db = require('../models');
const Employee = db.employees;
async function authAdmin(req, res, next) {
  const authHeader = req.headers['request_token'];
  const tokenData = jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, tokenData) => {
    if (err) {
      throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
    }
    return tokenData;
  });
  const loginFind = await Employee.findOne({ where: { active: true, idService: tokenData?.id, role: 'admin' } });
  if (!loginFind) {
    throw new CustomError(403, TypeError.PERMISSION_DENIED);
  }
  next();
}
module.exports = authAdmin;
