const db = require('../models');
const jwt = require('jsonwebtoken');

const { CustomError, TypeError } = require('../models/customError.model');
const ArticlePost = db.articlesPosts;


class ArticlePostController {

    async getArticlePostsByArticle(req, res) {
        const { articleId } = req.params;

        if (articleId) {
            const articlePosts = await ArticlePost.findAll({
                where: { articleId: articleId }
            })
            res.json(articlePosts ?? []);
        }
    }

    async createArticlePost(req, res) {
        const { postId, articleId } = req.body;
        const el = { postId, articleId };

        await ArticlePost.create(el);
        res.json({success: true});
    }

    // async updateArticle(req, res) {
    //     const { id, name, content, markId, employeePositionId, date, active, sectionId} = req.body;

    //     const foundArticle = Article.findOne({
    //         where: {
    //             id,
    //         }
    //     });
    //     if (!foundArticle) {
    //         throw new CustomError(404, TypeError.NOT_FOUND);
    //     } 

    //     const article = { name, content, markId, employeePositionId, date, active, sectionId };
    //     await Article.update(article, { 
    //         where: { 
    //             id 
    //         }
    //     });
    //     await res.json({ success: true });
    // }
}

module.exports = new ArticlePostController();