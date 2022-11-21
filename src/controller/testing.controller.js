const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');
const validUrl = require('valid-url');
const moment = require('moment');
const paginate = require('../utils/paginate');
const CategoryPostSubdivision = db.categoryPostSubdivisions;
const PostSubdivision = db.postSubdivisions;
const CategoryTesting = db.categoryTestings;
const CategoryEmployee = db.categoryEmployees;
const Category = db.categories;
const Testing = db.testings;
const Employee = db.employees;
const Post = db.posts;
class TestingController {
  async deleteTesting(req, res) {
    const { testingId } = req.body;
    const findTesting = await Testing.findOne({
      where: { id: testingId },
    });

    await Testing.update(
      { active: false },
      {
        where: { id: testingId },
      },
    );
    await CategoryPostSubdivision.update(
      { active: false },
      {
        where: { id: findTesting?.categoryPostSubdivisionId },
      },
    );
    res.json({ success: true });
  }
  async getTestingsUser(req, res) {
    const { id } = req.params;
    const { page } = req.query;
    const authHeader = req.headers['request_token'];
    if (!authHeader) {
      throw new CustomError(401, TypeError.PROBLEM_WITH_TOKEN);
    }
    const tokenData = jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, tokenData) => {
      if (err) {
        throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
      }
      return tokenData;
    });
    const employee = await Employee.findOne({
      where: {
        idService: tokenData?.id,
      },
      include: {
        model: PostSubdivision,
        include: {
          model: Category,
        },
      },
    });
    const categoryEmployee = await CategoryEmployee.findAll({
      where: { active: true, employeeId: employee?.id },
    });

    const findCategoryTesting = await CategoryTesting.findAll({
      where: {
        categoryId: {
          $in: categoryEmployee?.map((cat) => cat?.categoryId),
        },
      },
    });

    const findTestingList = await Testing.findAndCountAll(
      paginate(
        {
          where: {
            active: true,

            ...(id == -1
              ? {
                  dateEnd: {
                    $lte: new Date(),
                  },
                }
              : {
                  dateEnd: {
                    $gte: new Date(),
                  },
                }),

            ...(id != 0 && id != -1 && { testingFilterId: id }),
            id: {
              $in: findCategoryTesting?.map((cat) => cat?.testingId),
            },
          },
        },
        { page, pageSize: 6 },
      ),
    );

    res.json({ count: findTestingList?.count, list: findTestingList?.rows });
  }

  async getTestingSingleUser(req, res) {
    const { id } = req.params;

    const findTesting = await Testing.findOne({
      where: { categoryPostSubdivisionId: id },
    });
    res.json(findTesting);
  }

  async getTestingSingleAdmin(req, res) {
    const { id } = req.params;
    let posts = [];
    let cats = [];
    const findTesting = await Testing.findOne({
      where: { id },
      include: [
        {
          model: Category,
        },
      ],
    });
    for (let oneTest of findTesting?.categories) {
      const findCatPostSubdiv = await CategoryPostSubdivision.findOne({
        where: {
          categoryId: oneTest?.id,
        },
      });
      const findPostSubdiv = await PostSubdivision.findOne({
        where: {
          id: findCatPostSubdiv?.postSubdivisionId,
        },
      });
      posts.push(findPostSubdiv?.postId);
      cats.push(oneTest?.id);
    }
    posts = Array.from(new Set(posts));

    res.json({ ...findTesting.toJSON(), cats, posts });
  }
  async getTestings(req, res) {
    const { page, search } = req.query;
    let employeeListWithCat = [];
    const employeeCount = await Testing.count();
    const employeeList = await Testing.findAll(
      paginate(
        {
          where: {
            name: { $like: search + '%' },
          },
          include: [
            {
              model: CategoryPostSubdivision,
            },
            { model: Category },
          ],
        },
        { page, pageSize: 10 },
      ),
    );
    // for (let testItem of employeeList) {
    //   const findCat = await Category.findOne({
    //     where: { id: testItem?.categoryPostSubdivision?.categoryId },
    //   });
    //   employeeListWithCat.push({ ...testItem.toJSON(), category: findCat?.name });
    // }
    res.json({ count: employeeCount, list: employeeList });
  }

  async createTesting(req, res) {
    const { name, desc, dateEnd, dateStart, linkTest, postId, subdivisionId, categoryId, testingFilterId, catIds } = req.body;
    let catPostSubId;
    await validateBodyTesting(req.body);

    const testing = { name, desc, dateEnd: moment(dateEnd, 'DD.MM.YYYY'), dateStart: moment(dateStart, 'DD.MM.YYYY'), linkTest, testingFilterId };
    const newTesting = await Testing.create(testing);
    const newCatTestins = [];
    catIds?.map((catId) => {
      if (catId) {
        newCatTestins.push({
          categoryId: typeof catId === 'string' ? catId : catId[0],
          testingId: newTesting?.id,
        });
      }
    });
    if (newCatTestins?.length !== 0) {
      await CategoryTesting.bulkCreate(newCatTestins);
    }

    res.json({ success: true });
  }

  async updateTesting(req, res) {
    const { id, name, desc, dateEnd, dateStart, linkTest, postId, subdivisionId, categoryId, testingFilterId, catIds } = req.body;
    const findTesting = await Testing.findOne({
      where: { id },
    });
    if (!findTesting) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    await validateBodyTesting(req.body);

    const testing = { name, desc, dateEnd: moment(dateEnd, 'DD.MM.YYYY'), dateStart: moment(dateStart, 'DD.MM.YYYY'), linkTest, testingFilterId };
    await Testing.update(testing, { where: { id } });
    await CategoryTesting.destroy({
      where: {
        testingId: id,
      },
    });
    let newCatTestins = [];
    catIds?.map((catId) => {
      if (catId) {
        newCatTestins.push({
          categoryId: typeof catId === 'string' ? catId : catId[0],
          testingId: id,
        });
      }
    });
    if (newCatTestins?.length !== 0) {
      await CategoryTesting.bulkCreate(newCatTestins);
    }

    await res.json({ success: true });
  }
}

async function validateBodyTesting({ name, dateStart, desc, dateEnd, linkTest, postId, subdivisionId, categoryId }) {
  const date = moment(dateEnd, 'DD.MM.YYYY', true);
  const dateStartVa = moment(dateStart, 'DD.MM.YYYY', true);
  if (!date.isValid() || !dateStartVa.isValid() || !desc || !name || !validUrl.isHttpsUri(linkTest)) {
    throw new CustomError(401, TypeError.PARAMS_INVALID);
  }
}
module.exports = new TestingController();
