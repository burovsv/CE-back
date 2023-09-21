const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');


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
        const { id } = req.body;

        let foundArticleFile = await ArticleFile.findOne({
            where: { id: id }
        })

        // это все, если type !== video
        if (foundArticleFile.type !== 'video') {
            // получаем url файла  
            let url = foundArticleFile.url;
            let path = './public' + url;

            //удаление файла по url 
            fs.access(path, fs.F_OK, (err) => {
                if (!err) {
                    fs.unlink(path, error => {
                        if (error) {
                            throw new CustomError(404, TypeError.NOT_FOUND);
                        }
                    })
                }
            })
        }

        await ArticleFile.destroy({
            where: { id: id }
        })

        await res.json({ success: true })
    }

    async updateArticleFile(req, res) {
        const body = req.body;

        await ArticleFile.update(body, {
            where: { id: body.id }
        }
        )
    }
}

module.exports = new ArticleFileController();
