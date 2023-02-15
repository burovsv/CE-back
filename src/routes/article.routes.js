const Router = require('express');
const articleController = require('../controller/article.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/article/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleController.createArticle));
router.post('/article/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleController.updateArticle));

router.get('/article/list', errorWrapper(authAdmin), errorWrapper(articleController.getArticles));

module.exports = router;