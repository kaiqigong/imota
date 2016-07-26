import {Router} from 'express';
import config from '../../config/config';
import Post from '../models/Post';
import { verifySession } from '../middlewares/authChecker';
import PostCategory from '../models/PostCategory';

const router = new Router();

router.get('/', verifySession(), async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || config.pagination.defaultSize;
    const accountId = req.user._id;
    const category = req.query.category;
    const result = await Post.paginate({accountId, category}, {page, limit, sort: {created: -1}});
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.post('/', verifySession(), async (req, res, next) => {
  try {
    const accountId = req.user._id;
    const { category, content } = req.body;
    // need to check category
    if (category) {
      const categoryObj = await PostCategory.findOne({_id: category, accountId});
      if (!categoryObj) {
        return next({status: 400, message: '未找到分类'});
      }
    } else {
      return next({status: 400, message: '请选择分类'});
    }
    const post = new Post({category, accountId});
    post.name = '新建备忘录';
    let saved = false;
    let inc = 1;
    while (!saved) {
      try {
        await post.save();
        saved = true;
      } catch (err) {
        console.log(err.message);
        if (err && err.message && err.message.indexOf('$name_1_accountId_1_category_1 dup key') > -1) {
          post.name = '新建备忘录' + inc;
          inc++;
        } else {
          throw err;
        }
      }
    }
    const result = await Post.paginate({accountId}, {page: 1, limit: 1, sort: {created: -1}});
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', verifySession(), async (req, res, next) => {
  try {
    const accountId = req.user._id;
    const _id = req.params.id;
    if (!_id) {
      throw new Error('参数错误');
    }
    const result = await Post.update({accountId, _id}, {...req.body});
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', verifySession(), async (req, res, next) => {
  try {
    const accountId = req.user._id;
    const _id = req.params.id;
    if (!_id) {
      throw new Error('参数错误');
    }
    const result = await Post.remove({accountId, _id});
    res.send(result);
  } catch (err) {
    next(err);
  }
});

export default router;
