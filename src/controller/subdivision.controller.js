const db = require('../models');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const { default: axios } = require('axios');
const Subdivision = db.subdivisions;
const Post = db.posts;
const Category = db.categories;
const PostSubdivision = db.postSubdivisions;
class SubdivisionController {
  async getSubdivisions(req, res) {
    const subdivision = await Subdivision.findAll();
    res.json(subdivision);
  }

  async getSubdivisionsByPost(req, res) {
    const { postIds } = req.body;
    const cats = [];
    for (let postId of postIds) {
      cats.push(await getCatsBySubdiv(postId));
    }
    res.json(cats);
  }

  async getSubdivision(req, res) {
    const { id } = req.params;
    const subdivision = await Subdivision.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Post,
        },
      ],
    });
    res.json(subdivision);
  }

  async syncSubdivisions(req, res) {
    const dataFrom1C = await axios.get(`http://${process.env.API_1C_USER}:${process.env.API_1C_PASSWORD}@192.168.240.196/zup_pay/hs/Exch_LP/ListSubdivisions`);

    const formatData = formatSubdivisions(dataFrom1C.data);

    await upsertSubdivisions(formatData);
    await disableSubdivisions(formatData);

    res.json(formatData);
  }
}
function formatSubdivisions(data) {
  return data.map((item) => ({ idService: item?.ID, name: item?.name }));
}
function upsertSubdivisions(data) {
  return Promise.all(
    data.map((item) => {
      return checkSubdivisions(item);
    }),
  );
}
async function disableSubdivisions(data) {
  const ids = data.map(({ idService }) => idService);
  await Subdivision.update(
    { active: false },
    {
      where: {
        idService: {
          $notIn: ids,
        },
      },
    },
  );
  return Subdivision.update(
    { active: true },
    {
      where: {
        id: 1,
      },
    },
  );
}
async function checkSubdivisions({ idService, name }) {
  const findItem = await Subdivision.findOne({
    where: { idService },
  });
  if (findItem) {
    return Subdivision.update(
      { name, active: true },
      {
        where: {
          idService,
        },
      },
    );
  }
  const createData = {
    idService,
    name,
  };
  return Subdivision.create(createData);
}

async function getCatsBySubdiv(postId) {
  const firstPostSubdiv = await PostSubdivision.findOne({
    where: {
      postId: postId,
    },
    include: [
      {
        model: Category,
      },
    ],
  });
  return firstPostSubdiv;
}

module.exports = new SubdivisionController();
