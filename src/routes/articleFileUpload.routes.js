const Router = require('express');
const articleFilesUploadController = require('../controller/articleFileUpload.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/article/file/upload', errorWrapper(articleFilesUploadController.uploadArticleFile));
router.post('/article/file/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleFilesUploadController.updateArticleFile));

router.get('/article/file/list', errorWrapper(authAdmin), errorWrapper(articleFilesUploadController.getArticleFiles));
router.get('/article/file/list/:articleId', errorWrapper(articleFilesUploadController.getArticleFilesByArticle));

module.exports = router;