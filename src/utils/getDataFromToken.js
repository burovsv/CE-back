const db = require('../models');
const Employee = db.employees;
const jwt = require('jsonwebtoken');
const PostSubdivision = db.postSubdivisions;
const getDataFromToken = async (req) => {
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
  const findEmployee = await Employee.findOne({
    attributes: { exclude: ['password'] },
    where: { active: true, idService: tokenData.id },
    include: [
      {
        model: PostSubdivision,
      },
    ],
  });
  if (!findEmployee) {
    throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
  }

  return findEmployee;
};

module.exports = getDataFromToken;
