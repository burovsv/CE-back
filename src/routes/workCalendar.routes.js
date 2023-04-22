const Router = require('express');
const router = new Router();
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const { errorWrapper } = require('../middleware/customError');
const workCalendarController = require('../controller/workCalendar.controller');

router.get('/work-calendar/month', errorWrapper(auth), errorWrapper(workCalendarController.getWorkCalendarMonth));
router.post('/work-calendar/update', errorWrapper(auth), errorWrapper(workCalendarController.upsertWorkCalendarBySubdivision));
router.post('/work-calendar/excel', errorWrapper(auth), errorWrapper(workCalendarController.exportWorkCalendarToExcel));

module.exports = router;
