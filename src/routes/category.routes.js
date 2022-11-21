const Router = require('express');
const categoryController = require('../controller/category.controller');
const router = new Router();
const { errorWrapper } = require('../middleware/customError');

router.post('/category/create', errorWrapper(categoryController.createCategory));

router.get('/category/:subdivisionId/:postId', errorWrapper(categoryController.getCategoriesByPostAndBySubdivision));

module.exports = router;
