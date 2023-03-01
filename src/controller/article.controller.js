const db = require('../models');
const jwt = require('jsonwebtoken');
const moment = require('moment');


const { CustomError, TypeError } = require('../models/customError.model');
const Article = db.articles;
const ArticleEmployeePosition = db.articlesEmployeePositions;
const ArticleMark = db.articlesMarks;


class ArticleController {
    async getArticles(req, res) {
        const articles = await Article.findAll();
        res.json(articles);
    }

    async createArticle(req, res) {
        const { name, content, date, sectionId, employeePositionIds=[], markIds=[]} = req.body;

        const articleBody = {
            name, content, date, sectionId, active:true,
        }
        const article = await Article.create(articleBody);

        const articleEmployeePositions = employeePositionIds.map((employeePositionId) => ({employeePositionId, articleId: article?.id, active: true}));
        const articlesMarks = markIds.map((markId) => ({markId, articleId: article?.id, active: true}));

        console.log(articleEmployeePositions);
        console.log(articlesMarks);


        // await ArticleEmployeePosition.bulkCreate(articleEmployeePositions, {returning: true});
        await ArticleMark.bulkCreate(articlesMarks, {returning: true});

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