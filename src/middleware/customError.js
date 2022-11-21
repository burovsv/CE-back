const { CustomError } = require('../models/customError.model');

function handleError(err, req, res, next) {
  let customError = err;
  if (!(err instanceof CustomError)) {
    customError = new CustomError();
  }

  if (err.message) {
    console.error('\x1b[31m', '[ERROR] -', err);
  }
  res.status(customError.status).send(customError.response);
}
const errorWrapper = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { handleError, errorWrapper };
