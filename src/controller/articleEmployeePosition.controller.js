const db = require('../models');
const jwt = require('jsonwebtoken');

const { CustomError, TypeError } = require('../models/customError.model');
const ArticleEmployeePosition = db.articlesEmployeePositions;


class ArticleEmployeePositionController {

    async getArticleEmployeePositionsByArticle(req, res) {
        const { articleId } = req.params;

        if (articleId) {
            const articleEmployeePositions = await ArticleEmployeePosition.findAll({
                where: { articleId: articleId }
            })
            res.json(articleEmployeePositions ?? []);
        }
    }

    async createArticleEmployeePosition(req, res) {
        const { employeePositionId, articleId } = req.body;
        const el = { employeePositionId, articleId };

        await ArticleEmployeePosition.create(el);
        res.json({success: true});
    }

    // async updateArticle(req, res) {
    //     const { id, name, content, markId, employeePositionId, date, active, sectionId} = req.body;

    //     const foundArticle = Article.findOne({
    //         where: {
    //             id,
    //         }
    //     });
    //     if (!foundArticle) {
    //         throw new CustomError(404, TypeError.NOT_FOUND);
    //     } 

    //     const article = { name, content, markId, employeePositionId, date, active, sectionId };
    //     await Article.update(article, { 
    //         where: { 
    //             id 
    //         }
    //     });
    //     await res.json({ success: true });
    // }
}

module.exports = new ArticleEmployeePositionController();