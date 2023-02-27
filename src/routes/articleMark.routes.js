const Router = require('express');
const articleMarkController = require('../controller/articleMark.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/articlemark/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleMarkController.createArticleMark));
// router.post('/mark/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleMarkController.updateMark));

router.get('/articlemark/list/:articleId', errorWrapper(articleMarkController.getArticleMarksByArticle));

module.exports = router;