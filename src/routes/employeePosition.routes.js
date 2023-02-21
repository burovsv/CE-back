const Router = require('express');
const employeePositionController = require('../controller/employeePosition.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.get('/employeePositions/list', errorWrapper(authAdmin), errorWrapper(employeePositionController.getEmployeePositions));

module.exports = router;