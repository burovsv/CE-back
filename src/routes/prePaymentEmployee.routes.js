const Router = require('express');
const prePaymentEmployeeController = require('../controller/prePaymentEmployee.controller');
const authAdmin = require('../middleware/authAdmin');
const router = new Router();
const { errorWrapper } = require('../middleware/customError');

router.post('/prepayment/create', errorWrapper(prePaymentEmployeeController.createPrePaymentEmployee));
router.get('/prepayment/list', errorWrapper(prePaymentEmployeeController.getPrePaymentEmployee));
router.get('/prepayment/cashbox', errorWrapper(prePaymentEmployeeController.getCashBoxList));

module.exports = router;
