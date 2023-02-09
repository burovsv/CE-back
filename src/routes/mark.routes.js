const Router = require('express');
const markController = require('../controller/mark.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/mark/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(markController.createMark));
router.post('/mark/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(markController.updateMark));

router.get('/mark/list', errorWrapper(authAdmin), errorWrapper(markController.getMarks));

module.exports = router;