const Router = require('express');
const articleFilesController = require('../controller/articleFile.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/article/file/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleFilesController.createArticleFile));
router.post('/article/file/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleFilesController.updateArticleFile));

router.get('/article/file/list', errorWrapper(authAdmin), errorWrapper(articleFilesController.getArticleFiles));
router.get('/article/file/list/:articleId', errorWrapper(articleFilesController.getArticleFilesByArticle));

module.exports = router;