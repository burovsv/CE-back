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
const ArticleFile = db.articleFiles;




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
                      model: ArticleFile
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

    async getOneArticle(req, res) {
      // вынести в отдельную проверку
      const authHeader = req.headers['request_token'];

      if (!authHeader) {
          throw new CustomError(401, TypeError.PROBLEM_WITH_TOKEN);
        }

        const { id } = req.params;

        const article = await Article.findOne({
          where: {
            id: id
          },
          include: [
            {
              model: Mark,
            },
            {
              model: Section,
              include: [ { model: SectionGroup, } ]
            },
            {
              model: Post
            },
            {
              model: ArticleFile
            }
          ]
        })

        return res.json(article);

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

        const newArticle = {
          name,
          date,
          sectionId
        }
        
        // обновляем данные статьи
        await Article.update( newArticle,
            {
              where: { id }
            }
        )

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
            { model: ArticleFile }
        ]
        });


       
        // await res.json({ success: true });
    }

    async deleteArticle(req, res) {
        /* Удаление active: false */
    }
}

module.exports = new ArticleController();