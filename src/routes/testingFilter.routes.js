const Router = require('express');
const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');
const testingFilterController = require('../controller/testingFilter.controller');

router.post('/testing-filter/create', errorWrapper(testingFilterController.createTestingFilter));
router.get('/testing-filter/list', errorWrapper(testingFilterController.getTestingsFilters));
router.get('/testing-filter/user/list', errorWrapper(auth), errorWrapper(testingFilterController.getTestingsFiltersUser));
module.exports = router;
