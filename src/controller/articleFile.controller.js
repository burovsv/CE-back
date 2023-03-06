const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');

const ArticleFile = db.articleFiles;

class ArticleFileController {
    async createArticleFile(req, res) {
        // файл articleId

    }

    async deleteArticleFile(req, res) {

    }

    async getArticleFiles(req, res) {

    }

    async getArticleFilesByArticle(req, res) {

    }

    async updateArticleFile(req, res) {

    }
}

module.exports = new ArticleFileController();
