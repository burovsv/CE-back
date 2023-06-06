const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./src/models');
const bodyParser = require('body-parser');
const moment = require('moment');
const employeeRouter = require('./src/routes/employee.routes');
const searchRouter = require('./src/routes/search.routes');
const newsTypeRouter = require('./src/routes/newsType.routes');
const testingRouter = require('./src/routes/testing.routes');
const newsFilterRouter = require('./src/routes/newsFilter.routes');
const prePaymentRouter = require('./src/routes/prePaymentEmployee.routes');
const workCalendarRouter = require('./src/routes/workCalendar.routes');
const testingFilterRouter = require('./src/routes/testingFilter.routes');
const newsRouter = require('./src/routes/news.routes');
const categoryRouter = require('./src/routes/category.routes');
const subdivisionWorkTimeTemplateRouter = require('./src/routes/subdivisionWorkTimeTemplate.routes');
const settingPrePaymentRouter = require('./src/routes/settingPrePayment.routes');
const employeeHiddenRouter = require('./src/routes/employeeHidden.routes');
const postRouter = require('./src/routes/post.routes');
const subdivisionRouter = require('./src/routes/subdivision.routes');
const CategoryPostSubdivision = db.categoryPostSubdivisions;
const PostSubdivision = db.postSubdivisions;
const Category = db.categories;
const cheerio = require('cheerio');
const reset = require('./src/setup');
const { handleError } = require('./src/middleware/customError');
const { CustomError, TypeError } = require('./src/models/customError.model');
require('dotenv').config();

var corsOptions = {
  origin: '*',
};
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use('/images', express.static('./public/images'));
app.use('/excel', express.static('./public/excel'));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

db.sequelize.sync({ alter: true }).then(async (se) => {
  // let categoryPostSubdivisionList = [];
  // const activeCats = await Category.findAll({
  //   where: {
  //     active: true,
  //   },
  // });
  // const findPostSubdivisions = await PostSubdivision.findAll({
  //   where: {
  //     postId: 23,
  //   },
  // });
  // for (let cat of activeCats) {
  //   if (cat.id != 17) {
  //     for (let postSubdiv of findPostSubdivisions) {
  //       const categoryPostSubdivision = {
  //         categoryId: cat?.id,
  //         postSubdivisionId: postSubdiv?.id,
  //         active: false,
  //       };
  //       categoryPostSubdivisionList.push(categoryPostSubdivision);
  //     }
  //   }
  // }
  // await CategoryPostSubdivision.bulkCreate(categoryPostSubdivisionList);
});

app.use('/api', employeeRouter);
app.use('/api', newsFilterRouter);
app.use('/api', testingFilterRouter);
app.use('/api', newsRouter);
app.use('/api', testingRouter);
app.use('/api', subdivisionRouter);
app.use('/api', postRouter);
app.use('/api', categoryRouter);
app.use('/api', newsTypeRouter);
app.use('/api', searchRouter);
app.use('/api', workCalendarRouter);
app.use('/api', prePaymentRouter);
app.use('/api', subdivisionWorkTimeTemplateRouter);
app.use('/api', settingPrePaymentRouter);
app.use('/api', employeeHiddenRouter);
app.use(function (req, res, next) {
  throw new CustomError(404, TypeError.PATH_NOT_FOUND);
});
app.use(handleError);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
