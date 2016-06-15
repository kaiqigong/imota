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
    const todayBeats = await Beat.find({accountId: req.user._id, created: {$gt: moment({hour: 0})}});

    let todayLearningTime = 0; // Milliseconds
    let lastLearningStart = 0; // Milliseconds
    todayBeats.forEach((beat) => {
      const dur = beat.created.valueOf() - lastLearningStart;
      if (dur <= 1000 * 60) {
        todayLearningTime += dur;
      } else {
        todayLearningTime += 1000 * 10;
      }
      lastLearningStart = beat.created.valueOf();
    });
    histories.todayLearningTime = todayLearningTime / 1000 / 60;

    const totalCount = await Beat.count({accountId: req.user._id});
    if (histories.docs[0] && histories.docs[0].totalLearningTime) {
      histories.totalLearningTime = histories.docs[0].totalLearningTime + histories.todayLearningTime;
    } else {
      histories.totalLearningTime = histories.todayLearningTime;
    }

    res.send(histories);
  } catch (err) {
    next(err);
  }
});

export default router;
