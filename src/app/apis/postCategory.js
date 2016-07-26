import {Router} from 'express';
import config from '../../config/config';
import PostCategory from '../models/PostCategory';
import { verifySession } from '../middlewares/authChecker';

const router = new Router();

router.get('/', verifySession(), async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || config.pagination.defaultSize;
    const accountId = req.user._id;
    const result = await PostCategory.paginate({accountId}, {page, limit, sort: {created: 1}});
    res.send(result);
  } catch (err) {
    next(err);
  }
});

router.post('/', verifySession(), async (req, res, next) => {
  try {
    const accountId = req.user._id;
    const postCategory = new PostCategory({accountId});
    postCategory.name = '新建文件夹';
    let saved = false;
    let inc = 1;
    while (!saved) {
      try {
        await postCategory.save();
        saved = true;
      } catch (err) {
        if (err && err.message && err.message.indexOf('$name_1_accountId_1 dup key') > -1) {
          postCategory.name = '新建文件夹' + inc;
          inc++;
        } else {
          throw err;
        }
      }
    }
    const result = await PostCategory.paginate({accountId}, {page: 1, limit: 1, sort: {created: -1}});
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
      return next({status: 400, message: '参数错误'});
    }
    const result = await PostCategory.update({accountId, _id}, {...req.body});
    const postCategory = await PostCategory.findOne({accountId, _id});
    res.send(postCategory);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', verifySession(), async (req, res, next) => {
  try {
    const accountId = req.user._id;
    const _id = req.params.id;
    if (!_id) {
      throw new Error({status: 400, message: '参数错误'});
    }
    const result = await PostCategory.remove({accountId, _id});
    res.send(result);
  } catch (err) {
    next(err);
  }
});

export default router;
