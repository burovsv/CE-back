const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');

const Section = db.sections;

class SectionController {

    async getSections(req, res) {
        const sections = await Section.findAll();
        res.json(sections);
    }

    async getSectionsByGroup(req, res) {
        const { groupId } = req.params;

        if (groupId) {
            const sections = await Section.findAll({
                where: { sectionGroupId: groupId }
            })
            res.json(sections ?? []); 
        }
    }

    async createSection(req, res) {
        const { name, sectionGroupId } = req.body;
        const section = { name, sectionGroupId: sectionGroupId };
        if (section.name.length > 0 && section.sectionGroupId.length > 0) {
            await Section.create(section);
        }

        res.json({ success: true })
    }

    async updateSection(req, res) {
        const { id, name } = req.body;
        const foundSection = Section.findOne({
            where: {
                id,
            }
        });
        if (!foundSection) {
            throw new CustomError(404, TypeError.NOT_FOUND);
        } 

        const section = { name };
        await Section.update(section, { 
            where: { 
                id 
            }
        });
        await res.json({ success: true });
    }
}

module.exports = new SectionController();
