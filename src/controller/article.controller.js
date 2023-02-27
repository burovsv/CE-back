const db = require('../models');
const jwt = require('jsonwebtoken');

const { CustomError, TypeError } = require('../models/customError.model');
const Article = db.articles;


class ArticleController {
    async getArticles(req, res) {
        const articles = await Article.findAll();
        res.json(articles);
    }

    async createArticle(req, res) {
        const { name, content, date, sectionId} = req.body;

        const articleBody = {
            name, content, date, sectionId, active:true,
        }

        await Article.create(articleBody);
        res.json({success: true});
    }

    async updateArticle(req, res) {
        const { id, name, content, markId, employeePositionId, date, active, sectionId} = req.body;

        const foundArticle = Article.findOne({
            where: {
                id,
            }
        });
        if (!foundArticle) {
            throw new CustomError(404, TypeError.NOT_FOUND);
        } 

        const article = { name, content, markId, employeePositionId, date, active, sectionId };
        await Article.update(article, { 
            where: { 
                id 
            }
        });
        await res.json({ success: true });
    }

    async deleteArticle(req, res) {
        /* Удаление active: false */
    }
}

module.exports = new ArticleController();