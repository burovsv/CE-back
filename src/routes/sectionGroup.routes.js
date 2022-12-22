const Router = require(express);
const sectionGroupController = require('../controller/sectionGroup.controller');

const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const upload = require('../middleware/multer');

router.post('/sectionGroup/create', errorWrapper(authAdmin), upload.single('image'), errorWrapper(sectionGroupController.createSectionGroup));
router.post('/sectionGroup/update', errorWrapper(authAdmin), upload.single('image'), errorWrapper(sectionGroupController.updateSectionGroup));

router.get('/sectionGroup/list', errorWrapper(authAdmin), errorWrapper(sectionGroupController.getSectionGroups));

module.exports = router;