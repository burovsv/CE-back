const Router = require('express');
const searchController = require('../controller/settingPrePayment.controller');
const auth = require('../middleware/auth');

const router = new Router();
const { errorWrapper } = require('../middleware/customError');

router.get('/prepayment-date', errorWrapper(searchController.getSettingPrePayment));
module.exports = router;
