const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const path = require('path')
const mime = require("mime");

const ArticleFile = db.articleFiles;

class ArticleFileUploadController {
    async uploadArticleFile(req, res) {
        
        try {
            // файл articleId
            // Формируем уникальное имя по дате
            let name = moment().format("DD-MM-YY_HH-mm-ss");
            let file = req.files.file;
            
            const type = file.name.split('.').pop();
            const fullFileName = `${name}.${type}`;
            let filePath = `./public/article/images/${fullFileName}`;
            file.mv(filePath)

            res.json(fullFileName)
            
        } catch (error) {
            return res.status(500).json({message: 'Upload error'})
        }


    }
}

module.exports = new ArticleFileUploadController();
