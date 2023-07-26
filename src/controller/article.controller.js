const db = require('../models');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const _ = require('lodash');

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
            model: Post,
            where: {
              idService: {
                $like: `%${findPost.idService}%`
              }
            }
          },
          {
            model: ArticleFile
          }
        ],
      });
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
          include: [{ model: SectionGroup, }]
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
    const { name, content, date, sectionId, employeePositionIds = [], markIds = [], videos, files } = req.body;

    const articleBody = {
      name, date, sectionId
    }

    const article = await Article.create(articleBody);
    const articlesMarks = markIds.map((markId) => ({ markId, articleId: article?.id, active: true }));
    await ArticleMark.bulkCreate(articlesMarks, { returning: true });

    const articlesPosts = employeePositionIds.map((postId) => ({ postId, articleId: article?.id, active: true }));
    await ArticlePost.bulkCreate(articlesPosts, { returning: true });

    return res.json(article);
  }

  async updateArticle(req, res) {
    const { id, name, content, markIds, employeePositionIds, date, active, sectionId } = req.body;

    const newArticle = {
      name,
      date,
      sectionId
    }

    // обновляем данные статьи
    await Article.update(newArticle,
      {
        where: { id: id }
      }
    )

    const foundArticle = await Article.findOne({
      where: {
        id,
      },
      include: [
        { model: Mark },
        {
          model: Section,
          include: [
            { model: SectionGroup }
          ]
        },
        { model: Post },
        { model: ArticleFile }
      ]
    });

    // Изменение меток
    let prevMarksIds = foundArticle.marks.map(el => el.id);

    let toMarksAdd = _.difference(markIds, prevMarksIds);
    let toMarksDelete = _.difference(prevMarksIds, markIds);

    if (toMarksDelete.length > toMarksAdd.length) {

      for (let i = 0; i < toMarksDelete.length; i++) {
        const foundArticleMark = await ArticleMark.findOne({
          where: {
            articleId: id,
            markId: toMarksDelete[i]
          }
        })

        if (i < toMarksAdd.length) {
          let newArticleMark = {
            articleId: id,
            markId: toMarksAdd[i]
          }
          await ArticleMark.update(newArticleMark, { where: { id: foundArticleMark.id } });
        } else {
          await ArticleMark.destroy({ where: { id: foundArticleMark.id } });
        }
      }

    } else {

      for (let i = 0; i < toMarksAdd.length; i++) {
        let newArticleMark = {
          articleId: id,
          markId: toMarksAdd[i]
        }

        if (i < toMarksDelete.length) {
          const foundArticleMark = await ArticleMark.findOne({
            where: {
              articleId: id,
              markId: toMarksDelete[i]
            }
          })
          await ArticleMark.update(newArticleMark, { where: { id: foundArticleMark.id } });
        } else {
          await ArticleMark.create(newArticleMark);
        }
      }

    }

    // Изменение Должностей
    let prevPostsIds = foundArticle.posts.map(el => el.id);

    let toPostsAdd = _.difference(employeePositionIds, prevPostsIds);
    let toPostsDelete = _.difference(prevPostsIds, employeePositionIds);

    if (toPostsDelete.length > toPostsAdd.length) {

      for (let i = 0; i < toPostsDelete.length; i++) {
        const foundArticlePost = await ArticlePost.findOne({
          where: {
            articleId: id,
            postId: toPostsDelete[i]
          }
        })

        if (i < toPostsAdd.length) {
          let newArticlePost = {
            articleId: id,
            postId: toPostsAdd[i]
          }
          await ArticlePost.update(newArticlePost, { where: { id: foundArticlePost.id } });
        } else {
          await ArticlePost.destroy({ where: { id: foundArticlePost.id } });
        }
      }

    } else {

      for (let i = 0; i < toPostsAdd.length; i++) {
        let newArticlePost = {
          articleId: id,
          postId: toPostsAdd[i]
        }

        if (i < toPostsDelete.length) {
          const foundArticlePost = await ArticlePost.findOne({
            where: {
              articleId: id,
              postId: toPostsDelete[i]
            }
          })
          await ArticlePost.update(newArticlePost, { where: { id: foundArticlePost.id } });
        } else {
          await ArticlePost.create(newArticlePost);
        }
      }
    }

    await res.json({ success: true });
  }

  async deleteArticle(req, res) {
    const { id } = req.body;

    await Article.update({ active: false },
      {
        where: { id: id }
      }
    )
  }
}

module.exports = new ArticleController();