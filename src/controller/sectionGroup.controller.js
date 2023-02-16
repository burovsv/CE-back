const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');

const SectionGroup = db.sectionGroups;

class SectionGroupController {

    async getSectionGroups(req, res) {
        const sectionGroups = await SectionGroup.findAll();
        res.json(sectionGroups)
    }

    async createSectionGroup(req, res) {
        const { name } = req.body;
        const sectionGroup = { name };
        if (sectionGroup.name.length > 0) await SectionGroup.create(sectionGroup);

        res.json({ success: true })
    }

    async updateSectionGroup(req, res) {
        const { id, name } = req.body;
        const foundSectionGroup = SectionGroup.findOne({
            where: {
                id,
            }
        });
        if (!foundSectionGroup) throw new CustomError(404, TypeError.NOT_FOUND);

        const sectionGroup = { name };
        await SectionGroup.update(sectionGroup, { 
            where: { 
                id 
            }
        });
        await res.json({ success: true });
    }
}

module.exports = new SectionGroupController();
