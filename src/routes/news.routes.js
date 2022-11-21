const Router = require('express');
const newsController = require('../controller/news.controller');
var bodyParser = require('body-parser');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/news/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(newsController.createNews));
router.post('/news/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(newsController.updateNews));
module.exports = router;

router.get('/news/list', errorWrapper(authAdmin), errorWrapper(newsController.getNews));
router.get('/news/user/:newsFilterId', errorWrapper(newsController.getNewsUser));

router.get('/news/user/single/:newsId', errorWrapper(auth), errorWrapper(newsController.getNewsSingleUser));
router.get('/news/calendar', errorWrapper(auth), errorWrapper(newsController.getNewsCalendar));
router.get('/news/admin/single/:newsId', errorWrapper(authAdmin), errorWrapper(newsController.getNewsSingleAdmin));
router.post('/news/delete', errorWrapper(authAdmin), errorWrapper(newsController.deleteNews));
