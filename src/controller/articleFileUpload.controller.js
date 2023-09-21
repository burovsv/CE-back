const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const path = require('path')
const mime = require("mime");
const { forEach } = require('lodash');

const ArticleFile = db.articleFiles;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}


function checkAndCreateFolder(pathToFile) {
    fs.stat(pathToFile, function (err) {
        if (err) {
            fs.mkdir(`${pathToFile}`, err => {
                if (err) {
                    throw new CustomError(404, TypeError.NOT_FOUND);
                }
            })
        }
    })
}

// Функция проверки начального пути
function initPathToFiles() {
    const pathFolders = ['public', 'article', 'files'];
    let path = '.';

    pathFolders.forEach(folder => {
        path += `/${folder}`
        checkAndCreateFolder(path)
    })
}

class ArticleFileUploadController {
    async uploadArticleFile(req, res) {
        try {
            // файл articleId
            // Формируем уникальное имя по дате
            initPathToFiles();
            let namePostfix = getRandomInt(1000, 9999);
            let name = `${moment().format("DD-MM-YY_HH-mm-ss")}${namePostfix}`;
            let file = req.files.file;
            let body = req.body;

            const type = file.name.split('.').pop();
            const fullFileName = `${name}.${type}`;

            let pathToFile = `./public/article/files/${body.articleId}`;
            let filePath = `${pathToFile}/${fullFileName}`;

            fs.stat(pathToFile, function (err) {
                if (err) {
                    fs.mkdir(`${pathToFile}`, () => file.mv(filePath))
                }
                else file.mv(filePath)
            });

            let fileBody = {
                name: (body?.name) ? body?.name : name,
                url: `/article/files/${body.articleId}/${fullFileName}`,
                type: type,
                articleId: body.articleId,
                isMain: body?.isMain ?? false,
            }
            let articleFile = await ArticleFile.create(fileBody);

            await res.json({ success: true });

        } catch (error) {
            return res.status(500).json({ message: 'Upload error' })
        }
    }

    async uploadArticleImage(req, res) {
        try {
            let name = moment().format("DD-MM-YY_HH-mm-ss");
            let file = req.files.file;

            const type = file.name.split('.').pop();
            const fullFileName = `${name}.${type}`;
            let filePath = `./public/article/images/${fullFileName}`;
            file.mv(filePath)

            res.json(fullFileName)

        } catch (error) {
            return res.status(500).json({ message: 'Upload error' })
        }
    }
}

module.exports = new ArticleFileUploadController();
