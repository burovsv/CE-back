const Router = require('express');
const testingController = require('../controller/testing.controller');
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const router = new Router();
const { errorWrapper } = require('../middleware/customError');

router.post('/testing/create', errorWrapper(authAdmin), errorWrapper(testingController.createTesting));
router.post('/testing/update', errorWrapper(authAdmin), errorWrapper(testingController.updateTesting));

router.get('/testing/list', errorWrapper(authAdmin), errorWrapper(testingController.getTestings));
router.get('/testing/:id', errorWrapper(auth), errorWrapper(testingController.getTestingsUser));
router.get('/testing/admin/:id', errorWrapper(authAdmin), errorWrapper(testingController.getTestingSingleAdmin));
router.get('/testing/user/:id', errorWrapper(auth), errorWrapper(testingController.getTestingSingleUser));
router.post('/testing/delete', errorWrapper(authAdmin), errorWrapper(testingController.deleteTesting));
module.exports = router;
