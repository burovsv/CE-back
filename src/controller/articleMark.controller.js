const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');

const ArticleMark = db.articlesMarks;

class ArticleMarkController {
    async createArticleMark(req, res) {
        const { articleId, markId } = req.body;
        const el = { articleId, markId }

        if (el.articleId.length > 0 && el.markId.length > 0) {
            await ArticleMark.create(el);
        }

        res.json({ success: true })
    }

    async getArticleMarksByArticle(req, res) {
        const { articleId } = req.params;

        if (articleId) {
            const articleMarks = await ArticleMark.findAll({
                where: { articleId: articleId }
            })
            res.json(articleMarks ?? []);
        }
    }

    // async updateMark(req, res) {
    //     const { id, name } = req.body;
    //     const foundMark = Mark.findOne({
    //         where: {
    //             id,
    //         }
    //     });
    //     if (!foundMark) throw new CustomError(404, TypeError.NOT_FOUND);

    //     const mark = { name };
    //     await Mark.update( mark, { 
    //         where: { 
    //             id
    //         }
    //     });
    //     await res.json({ success: true });
    // }
}

module.exports = new ArticleMarkController();
