const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');

const ArticleFile = db.articleFiles;

class ArticleFileUploadController {
    async uploadArticleFile(req, res) {
        // файл articleId
        // Формируем уникальное имя по дате
        let name = moment().format("DD-MM-YY_HH-mm-ss");
        
        console.log(req.body);
        console.log(req);


    }
}

module.exports = new ArticleFileUploadController();
