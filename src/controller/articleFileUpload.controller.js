const db = require('../models');
const { CustomError, TypeError } = require('../models/customError.model');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const moment = require('moment');
const path = require('path')
const mime = require("mime");
const { forEach } = require('lodash');

const ArticleFile = db.articleFiles;


function checkAndCreateFolder(pathToFile) {
    fs.stat(pathToFile, function(err) {
            if (err) {
                fs.mkdir(`${pathToFile}`, err => {
                    if (err) {
                        console.log('error', err)
                        //  throw err;
                    }
                    // else console.log
                })
            }
        })
}

// Функция проверки начального пути
function initPathToFiles(){
    const pathFolders = ['public', 'article', 'files'];
    let path = '.';

    pathFolders.forEach(folder => {
        path += `/${folder}`
        checkAndCreateFolder(path)
    })
}

class ArticleFileUploadController {
    async uploadArticleFile(req, res) {

        // Проверить путь и есть ли папка с именем статьи
        // Если нет , то создать папку
        // Создать файл с нужным расширением
        // Сделать запись в бд в articleFiles
        /* articleFiles = {
                name: ,
                url: ,
                type: txt/pdf/video,
                decription: (для видео),
                articleId,
                isMain: true/false
        }
        */

        // Нужно проверить есть ли нужные папки на серыере, если нет, то создать
        // Проверять и создавать в несколько этапах похоже можно
        /*
            1) Есть ли "./public"
            2) Есть ли "./public/article/"
            3) Есть ли "./public/article/files/"
            4) Есть ли "./public/article/files/${body.articleId}/"
        */
    //    Можно создать массив, в котором последовательно переданы наименования папок
    // let path = ['public', 'article', 'files'] 
    // создать функцию, которая проверяет наличие начального пути для сохранения
    //  -> Работаем непосредственно с папкой статьи


    // На Чтение статьи это тоже будет влиять
        
        try {
            // файл articleId
            // Формируем уникальное имя по дате

            initPathToFiles();

            let name = moment().format("DD-MM-YY_HH-mm-ss");
            let file = req.files.file;
            let body = req.body;
            
            const type = file.name.split('.').pop();
            const fullFileName = `${name}.${type}`;

            let pathToFile = `./public/article/files/${body.articleId}`;
            let absolutePath = process.cwd()+pathToFile;
            let filePath = `${pathToFile}/${fullFileName}`;

            fs.stat(pathToFile, function(err) {
                if (err) {
                    fs.mkdir(`${pathToFile}`, () => {
                        file.mv(filePath)
                    })
                }
                else  {
                    console.log('Мы тутв');
                    file.mv(filePath)
                } 
        })


            // checkAndCreateFolder(pathToFile)


            let jj = ''

            res.json(fullFileName)
            
        } catch (error) {
            return res.status(500).json({message: 'Upload error'})
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
            return res.status(500).json({message: 'Upload error'})
        }
    }
}

module.exports = new ArticleFileUploadController();
