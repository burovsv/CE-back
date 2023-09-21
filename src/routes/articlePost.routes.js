const Router = require('express');
const articlePostController = require('../controller/articlePost.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/articlepost/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articlePostController.createArticlePost));
// router.post('/mark/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articlePostController.updateMark));

router.get('/articlepost/list/:articleId', errorWrapper(articlePostController.getArticlePostsByArticle));

module.exports = router;