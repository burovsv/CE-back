const Router = require('express');
const searchController = require('../controller/search.controller');
const auth = require('../middleware/auth');

const router = new Router();
const { errorWrapper } = require('../middleware/customError');

router.get('/search/', errorWrapper(auth), errorWrapper(searchController.globalSearch));
module.exports = router;
