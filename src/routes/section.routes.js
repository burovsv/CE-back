const Router = require('express');
const sectionController = require('../controller/section.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/section/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(sectionController.createSection));
router.post('/section/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(sectionController.updateSection));

router.get('/section/list', errorWrapper(sectionController.getSections));
router.get('/section/list/:groupId', errorWrapper(sectionController.getSectionsByGroup));

module.exports = router;