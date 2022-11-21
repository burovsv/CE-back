const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const NewsType = db.newsTypes;
class NewsTypeController {
  async getNewsTypes(req, res) {
    const findNewsTypes = await NewsType.findAll();
    if (findNewsTypes?.length === 0) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    res.json(findNewsTypes);
  }
}

module.exports = new NewsTypeController();
