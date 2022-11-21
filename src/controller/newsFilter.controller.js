const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const NewsFilter = db.newsFilters;
const NewsType = db.newsTypes;
const NewsPost = db.newsPosts;
const News = db.news;
const Employee = db.employees;
const Post = db.posts;
const PostSubdivision = db.postSubdivisions;
class NewsFilterController {
  async getNewsFilterUser(req, res) {
    const { type } = req.query;
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
    const findPostNews = await Post.findOne({
      where: {
        id: employee?.postSubdivision?.postId,
      },
      include: [
        {
          where: {
            active: true,
          },
          model: News,
          attributes: ['newsFilterId'],
        },
      ],
    });
    if (!findPostNews) {
      res.json([]);
    } else {
      const filterIds = findPostNews?.toJSON()?.news?.map((item) => item?.newsFilterId);

      const findNewsFilters = await NewsFilter.findAll({
        where: {
          id: {
            $in: filterIds,
          },
          ...((type == 1 || type == 2) && { newsTypeId: type }),
        },
      });

      res.json(findNewsFilters);
    }
  }

  async getNewsFilterByType(req, res) {
    const findNewsFilters = await NewsFilter.findAll();
    if (findNewsFilters?.length === 0) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }

    res.json(findNewsFilters);
  }

  async createNewsFilter(req, res) {
    const { name, newsTypeId } = req.body;
    const findNewsType = await NewsType.findOne({
      where: {
        id: newsTypeId,
      },
    });
    if (!findNewsType) {
      throw new CustomError(404, TypeError.NOT_FOUND);
    }
    const findNewsFilter = await NewsFilter.findOne({
      where: {
        name,
        newsTypeId,
      },
    });
    if (findNewsFilter) {
      throw new CustomError(400, TypeError.ALREADY_EXISTS);
    }
    const newsFilter = {
      name,
      newsTypeId,
    };
    const eq = await NewsFilter.create(newsFilter);

    res.json(eq);
  }
}

module.exports = new NewsFilterController();
