const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');
const jwt = require('jsonwebtoken');
var mime = require('mime-types');
var moment = require('moment');
fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const paginate = require('../utils/paginate');
const News = db.news;
const Post = db.posts;
const NewsPost = db.newsPosts;
const NewsCategory = db.newsCategories;
const CategoryEmployee = db.categoryEmployees;
const Employee = db.employees;
const PostSubdivision = db.postSubdivisions;
const NewsFilter = db.newsFilters;
const Category = db.categories;
const NewsType = db.newsTypes;
class NewsController {
  async getNewsSingleUser(req, res) {
    const { newsId } = req.params;
    const findNews = await News.findOne({
      where: { id: newsId },
      include: [{ model: NewsFilter }],
    });
    res.json(findNews);
  }
  async getNewsSingleAdmin(req, res) {
    const { newsId } = req.params;
    const findNews = await News.findOne({
      where: { id: newsId },
      include: [
        {
          model: Post,
        },
        { model: NewsFilter },
        { model: Category },
      ],
    });
    res.json(findNews);
  }

  async deleteNews(req, res) {
    const { newsId } = req.body;
    await News.update(
      { active: false },
      {
        where: { id: newsId },
      },
    );
    res.json({ success: true });
  }
  async getNewsUser(req, res) {
    const { newsFilterId } = req.params;
    const { newsTypeId, page } = req.query;
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
    const categoryEmployee = await CategoryEmployee.findAll({
      where: { active: true, employeeId: employee?.id },
    });
    const newsCategory = await NewsCategory.findAll({
      where: { active: true, categoryId: categoryEmployee?.map((cat) => cat?.categoryId) },
      raw: true,
    });
    const findNewsPosts = await NewsPost.findAll({
      where: {
        postId: employee?.postSubdivision?.postId,
      },
    });

    if (findNewsPosts?.length === 0) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }
    const newsCondition = {
      where: {
        id: {
          $in: [...findNewsPosts?.map((posts) => posts?.newsId), ...(newsTypeId == 1 ? newsCategory?.map((item) => item?.newsId) : [])],
        },
        ...(newsTypeId == 1 &&
          newsFilterId !== -1 && {
            dateEnd: {
              $gte: new Date(),
            },
          }),
        ...(newsTypeId == 1 &&
          newsFilterId == -1 && {
            dateEnd: {
              $lt: new Date(),
            },
          }),
        ...(newsTypeId == 2 && {
          datePublish: {
            $lte: new Date(),
          },
          ...(newsFilterId == -1
            ? {
                dateEnd: {
                  $gte: new Date(new Date().setMonth(new Date().getMonth() + 6)),
                },
              }
            : {
                dateEnd: {
                  $lte: new Date(new Date().setMonth(new Date().getMonth() + 6)),
                },
              }),
        }),
        active: true,
      },
      include: [
        {
          model: NewsFilter,
          where: {
            newsTypeId,
          },
          ...(newsFilterId != 0 &&
            newsFilterId != -1 && {
              where: {
                id: newsFilterId,
              },
            }),
        },
      ],
    };

    const newsCount = await News.count(newsCondition);
    const findNews = await News.findAll(
      paginate(
        {
          order: [['createdAt', 'DESC']],

          ...newsCondition,
        },
        { page, pageSize: 8 },
      ),
    );

    res.json({ count: newsCount, list: findNews });
  }
  async getNews(req, res) {
    const { page, search, type } = req.query;
    const newsCount = await News.count({
      where: {
        title: { $like: search + '%' },
        // '$NewsFilter.NewsType.id$': type,
      },
      include: [
        {
          model: NewsFilter,
          where: { newsTypeId: type },
          include: [
            {
              model: NewsType,
            },
          ],
        },
      ],
    });
    console.log(req.query);
    const newsList = await News.findAll(
      paginate(
        {
          order: [['createdAt', 'DESC']],
          where: {
            title: { $like: search + '%' },
            // '$NewsFilter.NewsType.id$': type,
          },
          include: [
            {
              model: NewsFilter,
              attributes: ['name'],
              where: { newsTypeId: type },
              include: [
                {
                  model: NewsType,
                  attributes: ['name'],
                },
              ],
            },
          ],
        },
        { page, pageSize: 10 },
      ),
    );

    res.json({ count: newsCount, list: newsList });
  }

  async createNews(req, res) {
    const { postIds, catIds, newsTypeId } = req.body;
    const postIdsArr = postIds.split(',');
    const catIdsArr = catIds.split(',');
    console.log(req.body);
    const data = await validateBodyNews(req.body, req.file);
    const newNews = await News.create(data);
    const newsPosts = postIdsArr.map((postId) => ({ postId, newsId: newNews?.id }));
    if (newsTypeId === '2') {
      const newsCategories = catIdsArr.map((categoryId) => ({ categoryId, newsId: newNews?.id }));
      await NewsCategory.bulkCreate(newsCategories);
    }

    await NewsPost.bulkCreate(newsPosts);

    return res.status(200).json({});
  }

  async updateNews(req, res) {
    const { id, postIds, catIds, newsTypeId } = req.body;
    const findNews = await News.findOne({
      where: {
        id,
      },
    });
    if (!findNews) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    if (req.file && findNews?.image) {
      const imagePath = path.join(path.resolve('./'), '/public/images');
      const imageFullPath = path.resolve(`${imagePath}/${findNews?.image}`);
      fs.exists(imageFullPath, function (exists) {
        if (exists) {
          fs.unlinkSync(imageFullPath);
        }
      });
    }
    const data = await validateBodyNews(req.body, req.file);

    const newNews = await News.update(data, { where: { id } });
    await NewsPost.destroy({
      where: {
        newsId: id,
      },
    });
    if (newsTypeId === '2') {
      await NewsCategory.destroy({
        where: {
          newsId: id,
        },
      });
      const newsCategories = catIds.split(',').map((categoryId) => ({ categoryId, newsId: id }));
      await NewsCategory.bulkCreate(newsCategories);
    }
    const newsPosts = postIds.split(',').map((postId) => ({ postId, newsId: id }));
    await NewsPost.bulkCreate(newsPosts);
    res.json({ success: true });
  }

  async getNewsCalendar(req, res) {
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
      include: {
        model: PostSubdivision,
      },
    });
    const categoryEmployee = await CategoryEmployee.findAll({
      where: { active: true, employeeId: employee?.id },
    });
    const newsCategory = await NewsCategory.findAll({
      where: { active: true, categoryId: categoryEmployee?.map((cat) => cat?.categoryId) },
    });

    const newsPost = await Post.findOne({
      where: {
        id: employee?.postSubdivision?.postId,
      },
      include: {
        where: {
          id: newsCategory?.map((item) => item?.newsId),
          datePublish: {
            $lte: new Date(),
          },
          dateEnd: {
            $lte: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          },
          active: true,
        },

        model: News,
      },
    });

    res.json(newsPost?.news);
  }
}
async function validateBodyNews({ title, desc, descShort, filterId, postIds, dateEnd, dateStart, datePublish, timeEnd, timeStart, timePublish, newsTypeId }, fileUpload) {
  const postIdsArr = postIds.split(',');
  let news = {
    title,
    desc,
    descShort,
  };
  let dates = {};
  const dateEndValid = moment(dateEnd, 'DD.MM.YYYY', true);
  const dateStartValid = moment(dateStart, 'DD.MM.YYYY', true);
  if (newsTypeId === '2') {
    const timeEndValid = moment(timeEnd, 'HH:mm', true);
    const timeStartValid = moment(timeStart, 'HH:mm', true);
    const timePublishValid = moment(timePublish, 'HH:mm', true);
    const datePublishValid = moment(datePublish, 'DD.MM.YYYY', true);
    if (
      (!dateEndValid.isValid() && dateEnd) ||
      (!dateStartValid.isValid() && dateStart) ||
      (!timeEndValid.isValid() && timeEnd) ||
      (!timeStartValid.isValid() && timeStart) ||
      (!timePublishValid.isValid() && timePublish) ||
      (!datePublishValid.isValid() && datePublish) ||
      !desc ||
      !title ||
      !descShort ||
      postIdsArr?.length == 0 ||
      !Array.isArray(postIdsArr)
    ) {
      throw new CustomError(401, TypeError.PARAMS_INVALID);
    }
    const timeEndSplit = timeEnd?.split(':');
    const timeStartSplit = timeStart?.split(':');
    const timePublishSplit = timePublish?.split(':');

    dates = {
      dateEnd: dateEndValid.set({ hour: timeEndSplit[0], minute: timeEndSplit[1] }).subtract(7, 'hour'),
      dateStart: dateStartValid.set({ hour: timeStartSplit[0], minute: timeStartSplit[1] }).subtract(7, 'hour'),
      datePublish: datePublishValid.set({ hour: timePublishSplit[0], minute: timePublishSplit[1] }).subtract(7, 'hour'),
    };
  } else {
    if ((!dateEndValid.isValid() && dateEnd) || (!dateStartValid.isValid() && dateStart) || !desc || !title || !descShort || postIdsArr?.length == 0 || !Array.isArray(postIdsArr)) {
      throw new CustomError(401, TypeError.PARAMS_INVALID);
    }
    dates = {
      dateEnd: dateEndValid,
      dateStart: dateStartValid,
    };
  }

  // if (date.isValid() && dateEnd) {
  news = { ...news, ...dates };
  // }
  const findPosts = await Post.findAll({
    where: {
      id: postIdsArr,
    },
  });
  if (findPosts?.length !== postIdsArr?.length) {
    throw new CustomError(404, TypeError.NOT_FOUND);
  }
  const findNewsFilter = await NewsFilter.findOne({
    where: {
      id: filterId,
    },
  });
  if (!findNewsFilter) {
    throw new CustomError(404, TypeError.NOT_FOUND);
  }
  news = { ...news, newsFilterId: filterId };

  if (fileUpload) {
    const imagePath = path.join(path.resolve('./'), '/public/images');
    const imageExtension = mime.extension(fileUpload.mimetype);
    const imageGenName = `${uuidv4()}.${imageExtension}`;
    const imageFullPath = path.resolve(`${imagePath}/${imageGenName}`);
    news = { ...news, image: imageGenName };
    fs.writeFile(imageFullPath, fileUpload.buffer, function (err) {
      if (err) throw new CustomError();
    });
  }
  return news;
}
module.exports = new NewsController();
