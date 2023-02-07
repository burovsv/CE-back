const Router = require('express');
const subdivisionWorkTimeTemplateController = require('../controller/subdivisionWorkTimeTemplate.controller');
var bodyParser = require('body-parser');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.get('/subdivision-worktime-template', errorWrapper(subdivisionWorkTimeTemplateController.getSubdivisionWorkTimeTemplate));
module.exports = router;
