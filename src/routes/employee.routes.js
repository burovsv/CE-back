const Router = require('express');
const employeeController = require('../controller/employee.controller');
const upload = require('../middleware/multer');
const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');

router.get('/employee/sync', errorWrapper(employeeController.syncEmployees));
router.post('/employee/login', errorWrapper(employeeController.loginEmployee));
router.post('/employee/delete', errorWrapper(authAdmin), errorWrapper(employeeController.deleteEmployee));
router.post('/employee/feedback', errorWrapper(auth), errorWrapper(employeeController.feedbackEmployee));

router.post('/employee/upload', errorWrapper(auth), upload.single('image'), errorWrapper(employeeController.uploadAvatar));

router.post('/employee/update', errorWrapper(authAdmin), errorWrapper(employeeController.updateEmployee));

router.post('/global/sync', errorWrapper(employeeController.syncGlobal));

router.get('/employee/download', errorWrapper(employeeController.downloadEmployees));

router.get('/employee/list', errorWrapper(authAdmin), errorWrapper(employeeController.getEmployees));
router.get('/employee/coeff', errorWrapper(employeeController.getCoeff));
router.get('/employee/:id', errorWrapper(authAdmin), errorWrapper(employeeController.getEmployee));
router.get('/employee/user/get', errorWrapper(auth), errorWrapper(employeeController.getEmployeeUser));
router.get('/auth', errorWrapper(auth), errorWrapper(employeeController.authEmployee));
router.get('/account', errorWrapper(auth), errorWrapper(employeeController.getAccountInfo));
router.get('/auth-admin/', errorWrapper(authAdmin), errorWrapper(employeeController.authAdmin));

module.exports = router;
