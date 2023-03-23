const db = require('../models');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const { CustomError, TypeError } = require('../models/customError.model');
const { articleFiles } = require('../models');
const Article = db.articles;
const ArticlePost = db.articlesPosts;
const ArticleMark = db.articlesMarks;
const Employee = db.employees;
const PostSubdivision = db.postSubdivisions;
const Post = db.posts;
const Mark = db.marks;
const Section = db.sections;
const SectionGroup = db.sectionGroups;
const articleFile = db.articleFiles;




class ArticleController {
    async getArticles(req, res) {
        const articles = await Article.findAll();

        return res.json(articles);
    }

    async getArticlesUser(req, res) {
        const authHeader = req.headers['request_token'];

        if (!authHeader) {
            throw new CustomError(401, TypeError.PROBLEM_WITH_TOKEN);
          }
          const tokenData = jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, tokenData) => {
            if (err) {
              throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
            }
            return tokenData;
          });

          const employee = await Employee.findOne({
            where: {
              idService: tokenData?.id,
            },
            include: [
              {
                model: PostSubdivision,
              },
            ],
          });

          const findPost = await Post.findOne({
            where: { id: employee?.postSubdivision?.postId },
          });

          let articles = null;

          if (findPost?.idService == 1111) {
            articles = await Article.findAll({
                include: [
                    {
                        model: Mark,
                    },
                    {
                      model: Section,
                      include: [
                        {
                          model: SectionGroup,
                        }
                      ]
                    },
                    {
                      model: Post
                    },
                    {
                      model: articleFile
                    }
                ]
            });
          } else {
            // Для обычных пользователей
            // articles = await Article.findAll({
            //     where: {
            //       employeePositionId: {
            //         [Op.like]: `%${findPost.idService}%`
            //       }
            //     }
            //   });
          }

          return res.json(articles)
    }

    async createArticle(req, res) {
        const { name, content, date, sectionId, employeePositionIds=[], markIds=[], videos, files} = req.body;

        const articleBody = {
            name, date, sectionId
        }

        const article = await Article.create(articleBody);
        const articlesMarks = markIds.map((markId) => ({markId, articleId: article?.id, active: true}));
        await ArticleMark.bulkCreate(articlesMarks, {returning: true});

        const articlesPosts = employeePositionIds.map((postId) => ({postId, articleId: article?.id, active: true}));
        await ArticlePost.bulkCreate(articlesPosts, {returning: true});

        return res.json(article);
    }

    async updateArticle(req, res) {
        const { id, name, content, markId, employeePositionId, date, active, sectionId} = req.body;

        
        const foundArticle = Article.findOne({
          where: {
            id,
          },
          include: [
            { model: Mark },
            { model: Section,
              include: [
                {
                  model: SectionGroup,
                }
              ]},
            { model: Post },
            { model: articleFile }
        ]

        });
        if (!foundArticle) {
          throw new CustomError(404, TypeError.NOT_FOUND);
        } 
        // update data to the db
        let newMarks = markId;
        let prevMarks = foundArticle?.marks;

        // обновить данные в бвзе данных articleMarks
        // К удалению, к добавлению, к обновлению
        // 1. Найти все метки которые были в статье
        // 2. Найти все метки которые пришли в запросе
        // 3. Сравнить их
        // 4. Если есть метки которые были в статье, но их нет в запросе, то удалить
        // 5. Если есть метки которые пришли в запросе, но их нет в статье, то добавить
        // 6. Если есть метки которые есть в статье и в запросе, то обновить

        function compareMark(prevMark, newMark) {
          return prevMark.id === newMark.id;
        }

        const deletedMarks = prevMarks.filter((prevMark) => !newMarks.some((newMark) => compareMark(prevMark, newMark)));
        const addedMarks = newMarks.filter((newMark) => !prevMarks.some((prevMark) => compareMark(prevMark, newMark)));
        const updatedMarks = newMarks.filter((newMark) => prevMarks.some((prevMark) => compareMark(prevMark, newMark)));

        const deletedMarksIds = deletedMarks.map((mark) => mark.id);
        const addedMarksIds = addedMarks.map((mark) => mark.id);
        const updatedMarksIds = updatedMarks.map((mark) => mark.id);

        await ArticleMark.destroy({
          where: {
            id: deletedMarksIds,
          },
        });

        const articlesMarks = addedMarksIds.map((markId) => ({markId, articleId: id, active: true}));
        await ArticleMark.bulkCreate(articlesMarks, {returning: true});

        const articlesMarksUpdate = updatedMarksIds.map((markId) => ({markId, articleId: id, active: true}));
        await ArticleMark.bulkCreate(articlesMarksUpdate, {returning: true});

        // posts
        let newPosts = employeePositionId;
        let prevPosts = foundArticle?.posts;

        function comparePost(prevPost, newPost) {
          return prevPost.id === newPost.id;
        }

        const deletedPosts = prevPosts.filter((prevPost) => !newPosts.some((newPost) => comparePost(prevPost, newPost)));
        const addedPosts = newPosts.filter((newPost) => !prevPosts.some((prevPost) => comparePost(prevPost, newPost)));
        const updatedPosts = newPosts.filter((newPost) => prevPosts.some((prevPost) => comparePost(prevPost, newPost)));

        const deletedPostsIds = deletedPosts.map((post) => post.id);
        const addedPostsIds = addedPosts.map((post) => post.id);
        const updatedPostsIds = updatedPosts.map((post) => post.id);

        await ArticlePost.destroy({
          where: {
            id: deletedPostsIds,
          },
        });

        const articlesPosts = addedPostsIds.map((postId) => ({postId, articleId: id, active: true}));
        await ArticlePost.bulkCreate(articlesPosts, {returning: true});

        const articlesPostsUpdate = updatedPostsIds.map((postId) => ({postId, articleId: id, active: true}));
        await ArticlePost.bulkCreate(articlesPostsUpdate, {returning: true});

        // change table uploadFiles 
        // 1. Найти все файлы которые были в статье
        // 2. Найти все файлы которые пришли в запросе
        // 3. Сравнить их
        // 4. Если есть файлы которые были в статье, но их нет в запросе, то удалить

        let newFiles = files;
        let prevFiles = foundArticle?.articleFiles;

        function compareFile(prevFile, newFile) {
          return prevFile.id === newFile.id;
        }

        const deletedFiles = prevFiles.filter((prevFile) => !newFiles.some((newFile) => compareFile(prevFile, newFile)));
        const addedFiles = newFiles.filter((newFile) => !prevFiles.some((prevFile) => compareFile(prevFile, newFile)));
        const updatedFiles = newFiles.filter((newFile) => prevFiles.some((prevFile) => compareFile(prevFile, newFile)));

        const deletedFilesIds = deletedFiles.map((file) => file.id);
        const addedFilesIds = addedFiles.map((file) => file.id);
        const updatedFilesIds = updatedFiles.map((file) => file.id);

        await ArticleFile.destroy({
          where: {
            id: deletedFilesIds,
          },
        });

        const articlesFiles = addedFilesIds.map((fileId) => ({fileId, articleId: id, active: true}));
        await ArticleFile.bulkCreate(articlesFiles, {returning: true});

        const articlesFilesUpdate = updatedFilesIds.map((fileId) => ({fileId, articleId: id, active: true}));
        await ArticleFile.bulkCreate(articlesFilesUpdate, {returning: true});

        // удалить статические файлы которые были удалены из статьи
        // удалить файлы из папки public/article/files/articleId
        // удалить файлы из папки public/article/images/articleId

        // добавить статические файлы которые были добавлены в статью
        // добавить файлы в папку public/article/files/articleId
        // добавить файлы в папку public/article/images/articleId

        // изменить статические файлы которые были изменены в статье

        // изменить данные статьи

        const articleBody = {
          name, date, sectionId
        }
// изменяем данные статьи
        await Article.update(articleBody, { 
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