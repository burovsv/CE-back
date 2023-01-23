const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { TypeError } = require('../models/customError.model');
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
    const prePaymentList = await PrePaymentEmployee.findAll({
      where: {
        managerId: employee.id,
        subdivisionId: subdivision,
      },
      order: [['date', 'DESC']],
      raw: true,
      //   include: {
      //     model: Employee,
      //     as: 'children',
      //     where: { lastName: { $like: search + '%' } },
      //     through: { where: { subdivisionId: subdivision }, order: [['date', 'DESC']] },
      //     include: {
      //       model: PostSubdivision,
      //     },
      //   },
    });
    let prePaymentWithName = [];
    const prePaymentEmployee = await Employee.findAll({
      where: { lastName: { $like: search + '%' }, id: { $in: prePaymentList?.map((itemPre) => itemPre?.employeeId) } },
    });

    for (let prePaymentItem of prePaymentList) {
      const findEmployee = prePaymentEmployee.find((employeeItem) => employeeItem.id == prePaymentItem.employeeId);
      if (findEmployee) {
        prePaymentWithName.push({ ...prePaymentItem, fullName: `${findEmployee.firstName} ${findEmployee.lastName}` });
      }
    }
    let sortedList = [];

    if (prePaymentWithName?.length >= 1) {
      sortedList = paginate(prePaymentWithName, 10, page);
    }
    res.json({ list: sortedList, pages: prePaymentWithName?.length });
  }
}
function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}
module.exports = new PrePaymentEmployeeController();
