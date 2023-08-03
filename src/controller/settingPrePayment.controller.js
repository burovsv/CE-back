const db = require('../models');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { CustomError, TypeError } = require('../models/customError.model');

const SettingPrePayment = db.settingPrePayment;
class SettingPrePaymentController {
  async getSettingPrePayment(req, res) {
    const findSetting = await SettingPrePayment.findOne();
    res.json(findSetting);
  }
}
module.exports = new SettingPrePaymentController();
