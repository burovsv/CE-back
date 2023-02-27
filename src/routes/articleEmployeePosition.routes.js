const Router = require('express');
const articleEmployeePositionController = require('../controller/articleEmployeePosition.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/articlemployeeposition/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleEmployeePositionController.createArticleEmployeePosition));
// router.post('/mark/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(articleEmployeePositionController.updateMark));

router.get('/articleemployeeposition/list/:articleId', errorWrapper(articleEmployeePositionController.getArticleEmployeePositionsByArticle));

module.exports = router;