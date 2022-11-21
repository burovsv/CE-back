const Router = require('express');
const postController = require('../controller/post.controller');
const authAdmin = require('../middleware/authAdmin');
const router = new Router();
const { errorWrapper } = require('../middleware/customError');

router.get('/post/sync', errorWrapper(postController.syncPosts));
router.get('/post/list', errorWrapper(authAdmin), errorWrapper(postController.getPosts));

module.exports = router;
