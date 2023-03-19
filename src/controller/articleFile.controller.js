const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');

const ArticleFile = db.articleFiles;

class ArticleFileController {
    async createArticleFile(req, res) {
        
        const body = req.body;

        let fileBody = {
            name: body.name,
            url: body.url,
            type: body.type,
            articleId: body.articleId,
            isMain: body?.isMain ?? false,
            description: body?.description ?? '',
        }

        let articleFile = await ArticleFile.create(fileBody);

        await res.json({ success: true });
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
