const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const { sequelize } = require('../models');
const getDataFromToken = require('../utils/getDataFromToken');
const PrePaymentEmployee = db.prePaymentEmployee;
const Employee = db.employees;
const PostSubdivision = db.postSubdivisions;

class PrePaymentEmployeeController {
  async createPrePaymentEmployee(req, res) {
    const { list, subdivision } = req.body;
    const employee = await getDataFromToken(req);
    let prePaymentEmployeeData = [];
    Object.keys(list).map(function (key, index) {
      if (list[key]?.sum) {
        prePaymentEmployeeData.push({
          managerId: employee.id,
          employeeId: key,
          subdivisionId: subdivision,
          sum: list[key].sum,
          date: new Date(),
        });
      }
    });
    await PrePaymentEmployee.bulkCreate(prePaymentEmployeeData);
    res.json(true);
  }

  async getPrePaymentEmployee(req, res) {
    const employee = await getDataFromToken(req);
    const { page, search, subdivision } = req.query;
    const findEmployee = await Employee.findOne({
      where: {
        id: employee.id,
      },
      include: {
        model: Employee,
        as: 'children',
        where: { lastName: { $like: search + '%' } },
        through: { where: { subdivisionId: subdivision }, order: [['date', 'DESC']] },
        include: {
          model: PostSubdivision,
        },
      },
    });
    let sortedList = [];

    if (findEmployee?.children) {
      sortedList = paginate(findEmployee?.children, 2, page);
    }
    res.json({ list: sortedList, pages: findEmployee?.children?.length });
  }
}
function paginate(array, page_size, page_number) {
  return array
    .sort(function (a, b) {
      return new Date(b.prePaymentEmployee.date) - new Date(a.prePaymentEmployee.date);
    })
    .slice((page_number - 1) * page_size, page_number * page_size);
}
module.exports = new PrePaymentEmployeeController();
