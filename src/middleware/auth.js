require('dotenv').config();
const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const db = require('../models');
const Employee = db.employees;
async function auth(req, res, next) {
  try {
  } catch (error) {}
  const authHeader = req.headers['request_token'];
  if (!authHeader) {
    throw new CustomError(401, TypeError.PROBLEM_WITH_TOKEN);
  }
  const tokenData = jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, tokenData) => {
    if (err) {
      throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
    }
    return tokenData;
  });
  const loginFind = await Employee.findOne({ raw: true, where: { active: true, idService: tokenData.id } });
  if (!loginFind) {
    throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
  }
  next();
}
module.exports = auth;
