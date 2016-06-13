import {Router} from 'express';
import {verifySession} from '../middlewares/authChecker';
import Beat from '../models/Beat';
import LearningHistory from '../models/LearningHistory';
import config from '../../config/config';
import moment from 'moment';

const router = new Router();

router.get('/', async (req, res, next) => {
  try {
    const time = new Date() - (new Date(req.session.startTime));
    res.send({time});
  } catch (err) {
    next(err);
  }
});

router.post('/beats/', verifySession(), async (req, res, next) => {
  try {
    const beat = new Beat();
    beat.accountId = req.user._id;
    beat.url = req.body.url;
    await beat.save();
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.get('/learning_histories/', verifySession(), async (req, res, next) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || config.pagination.defaultSize;
    const histories = await LearningHistory.paginate({accountId: req.user._id}, {page, limit, sort: {date: -1}});
    const count = await Beat.count({accountId: req.user._id, created: {$gt: moment({hour: 0})}});
    const totalCount = await Beat.count({accountId: req.user._id});
    histories.todayLearningTime = count * 0.5;
    histories.totalLearningTime = totalCount * 0.5;
    res.send(histories);
  } catch (err) {
    next(err);
  }
});

export default router;
