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
const EmployeeHistory = db.employeeHistories;
const PostSubdivision = db.postSubdivisions;
const Subdivision = db.subdivisions;

class PrePaymentEmployeeController {
  async createPrePaymentEmployee(req, res) {
    const { list, subdivision, cashBox } = req.body;
    const employee = await getDataFromToken(req);
    let prePaymentEmployeeData = [];
    let prePaymentEmployeeDataPostRequest = [];
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
    for (let itemData of prePaymentEmployeeData) {
      const findEmployeeItem = await Employee.findOne({
        where: {
          id: itemData?.employeeId,
        },
      });
      const findEmployeeHistory = await EmployeeHistory.findOne({
        where: {
          employeeId: itemData?.employeeId,
        },
      });
      if (findEmployeeHistory) {
        prePaymentEmployeeDataPostRequest.push({
          id: findEmployeeItem?.idService,
          employ: findEmployeeHistory?.employeeExternalId,
          pay: parseInt(itemData?.sum),
        });
      }
    }
    const findSubdivision = await Subdivision.findOne({ where: { id: subdivision } });
    const urlPost = `http://ExchangeHRM:k70558ga@192.168.240.196/zup_pay/hs/Exch_LP/prepaid_еxpense?id_city=${findSubdivision.idService}&id_cashbox=${cashBox.id_cashbox}&name_cashbox=${cashBox.name_cashbox.replace(/\s/g, '')}`;
    console.log(urlPost);
    const listCashBox = await axios.post(encodeURI(urlPost), prePaymentEmployeeDataPostRequest);
    console.log(listCashBox.data);
    console.log(prePaymentEmployeeDataPostRequest);
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
  async getCashBoxList(req, res) {
    const { subdivision } = req.query;
    const findSubdivision = await Subdivision.findOne({ where: { id: subdivision } });
    const listCashBox = await axios.get(`
     http://ExchangeHRMUser:k70600ga@192.168.240.196/zup_pay/hs/Exch_LP/list_cashbox?id_city=${findSubdivision.idService}`);
    // const listCashBox = {
    //   id_city_ut11: 'ef2cfedc-e31f-11ec-80cd-1402ec7abf4d',
    //   list_cashbox: [
    //     {
    //       id_cashbox: 'd595f1a2-e5ff-11ec-80cd-1402ec7abf4d',
    //       name_cashbox: 'Абакан_CENALOM - Конуркин В. В. ИП',
    //     },
    //     {
    //       id_cashbox: 'e74dd8bc-e548-11ec-80cd-1402ec7abf4d',
    //       name_cashbox: 'Абакан_CENALOM - Ценалом ООО (лт)',
    //     },
    //   ],
    // };
    res.json(listCashBox.data['list_cashbox']);
  }
}
function paginate(array, page_size, page_number) {
  return array.slice((page_number - 1) * page_size, page_number * page_size);
}
module.exports = new PrePaymentEmployeeController();
