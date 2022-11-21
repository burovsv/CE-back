const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const { sequelize } = require('../models');
const TestingFilter = db.testingFilters;
const Testing = db.testings;
const Employee = db.employees;
const PostSubdivision = db.postSubdivisions;
const Category = db.categories;

class TestingFilterController {
  async createTestingFilter(req, res) {
    const { name } = req.body;

    const testingFilter = {
      name,
    };
    const eq = await TestingFilter.create(testingFilter);
    res.json(eq);
  }
  async getTestingsFiltersUser(req, res) {
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
    const employeeCats = await Employee.findOne({
      where: {
        idService: tokenData?.id,
      },
      include: {
        model: Category,
        attributes: ['id'],
        include: {
          model: Testing,
          where: {
            active: true,
            dateEnd: {
              $gte: new Date(),
            },
          },
          attributes: ['testingFilterId'],
        },
      },
    });
    let filterTestingIds = [];
    // for (let item of employeeCats) {
    //   for (let test of item?.testings) {
    //     filterTestingIds.push(test?.testingFilterId);
    //   }
    // }
    employeeCats?.categories?.map((item) => {
      item?.testings?.map((test) => {
        filterTestingIds.push(test?.testingFilterId);
      });
    });
    filterTestingIds = [...new Set(filterTestingIds)];

    const filterTestingIdsFilters = await TestingFilter.findAll({
      where: {
        id: filterTestingIds,
      },
    });

    res.json(filterTestingIdsFilters);
  }
  async getTestingsFilters(req, res) {
    const data = await TestingFilter.findAll();

    res.json(data);
  }
}

module.exports = new TestingFilterController();
