const TypeError = {
  PROBLEM_WITH_TOKEN: 'PROBLEM_WITH_TOKEN',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
  LOGIN_ERROR: 'LOGIN_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  PARAMS_INVALID: 'PARAMS_INVALID',
  PATH_NOT_FOUND: 'PATH_NOT_FOUND',
};

class CustomError {
  constructor(status = 500, response = TypeError.UNEXPECTED_ERROR) {
    this.status = status;
    if (TypeError.hasOwnProperty(response)) {
      this.response = { error: response };
    } else {
      this.response = response;
    }
  }
}
module.exports = { CustomError, TypeError };
