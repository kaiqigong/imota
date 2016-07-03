import {Router} from 'express';
import config from '../../config/config';
import RedisCache from '../../redis/RedisCache';
import logger from '../../utils/logger';
import Sentence from '../models/Sentence';

const router = new Router();

router.get('/', async (req, res, next) => {
  try {
    const {courseNo, lessonNo} = req.query;
    const result = {
      docs: await Sentence.find({courseNo, lessonNo}).sort({sentenceNo: 1}).exec(),
    }
    res.send(result);
  } catch (err) {
    next(err);
  }
});

export default router;
