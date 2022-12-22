const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');

const Mark = db.marks;

class MarkController {
    async createMark(req, res) {
        const { name } = req.body;
        const mark = { name };
        if (mark.name.length > 0) {
            await Mark.create(mark);
        }

        res.json({ success: true })
    }

    async deleteMark(req, res) {
        // const markId = req.body;
        // const findTesting = await Testing.findOne({
        //     where: { id: testingId },
        //   }); 
    }

    async getMarks(req, res) {
        const marks = await Mark.findAll();
        res.json(marks)
    }

    async updateMark(req, res) {
        const { id, name } = req.body;
        const foundMark = Mark.findOne({
            where: {
                id,
            }
        });
        if (!foundMark) {
            throw new CustomError(404, TypeError.NOT_FOUND);
        } 

        const mark = { name };
        await Mark.update(mark, { 
            where: { 
                id 
            }
        });
        await res.json({ success: true });
    }
}

module.exports = new MarkController();
