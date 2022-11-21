const Router = require('express');
const newsController = require('../controller/news.controller');
var bodyParser = require('body-parser');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

const newsTypeController = require('../controller/newsType.controller');

router.get('/news-type/list', errorWrapper(newsTypeController.getNewsTypes));

module.exports = router;
