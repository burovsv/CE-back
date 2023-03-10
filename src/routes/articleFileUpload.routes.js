const Router = require('express');
const articleFilesUploadController = require('../controller/articleFileUpload.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/article/file/upload',  articleFilesUploadController.uploadArticleFile);
router.post('/article/image/upload',  articleFilesUploadController.uploadArticleImage);

module.exports = router;