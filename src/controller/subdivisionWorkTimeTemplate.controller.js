const db = require('../models');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { CustomError, TypeError } = require('../models/customError.model');

const SubdivisionWorkTimeTemplates = db.subdivisionWorkTimeTemplates;
class SubdivisionWorkTimeTemplateController {
  async getSubdivisionWorkTimeTemplate(req, res) {
    const { subdivision } = req.query;
    const templates = await SubdivisionWorkTimeTemplates.findOne({
      where: { subdivisionId: subdivision },
    });

    res.json(templates);
  }
}
module.exports = new SubdivisionWorkTimeTemplateController();
