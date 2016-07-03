import {Router} from 'express';
import config from '../../config/config';
import BossAnswer from '../models/BossAnswer';
import BossWork from '../models/BossWork';
import Sentence from '../models/Sentence';
import wechat from '../../utils/wechat';
import request from '../../utils/request';
import randomstring from 'randomstring';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import homeworkProcessor from './homeworkProcessor';
import { verifySession } from '../middlewares/authChecker';
import _ from 'lodash';

const router = new Router();

router.post('/', verifySession(), async (req, res, next) => {
  try {
    const {serverIds, lessonNo, courseNo, bossNo, type} = req.body;
    const accountId = req.user._id;
    const accessToken = await wechat.getAccessToken();
    // download
    console.log(`http://file.api.weixin.qq.com/cgi-bin/media/get`, {access_token: accessToken, media_id: serverIds});
    const files = [];
    for (let id in serverIds) {
      const file = await homeworkProcessor.downloadFileFromWechat(accessToken, serverIds[id]);
      files.push(file);
    }
    console.log(files);

    const audios = [];

    for (let id in files) {
      const audio = await homeworkProcessor.uploadFileToQiniu(files[id]);
      audios.push(audio);
    }
    console.log(audios);

    let audio;
    try {
      audio = await homeworkProcessor.concatAudios(files);
    } catch (err) {
      console.log(err);
    }

    if (audio) {
      audio = await homeworkProcessor.uploadFileToQiniu(audio);
    }

    const bossAnswer = await BossAnswer.update({lessonNo, courseNo, bossNo, accountId, type},
      {lessonNo, courseNo, bossNo, accountId, audio, audios, type, serverIds}, {upsert: true, setDefaultsOnInsert: true}).exec();
    res.send(bossAnswer);
  } catch (err) {
    next(err);
  }
});


router.get('/', verifySession(), async (req, res, next) => {
  const accountId = req.user._id;
  const {lessonNo, courseNo, type} = req.query;
  try {
    const bosses = await Sentence.find({lessonNo, courseNo}).sort({sentenceNo: 1}).lean().exec()
    const bossAnswers = await BossAnswer.find({lessonNo, courseNo, accountId, type}).sort({bossNo: 1}).exec()

    bosses.forEach(boss => {
      const bossAnswer = _.find(bossAnswers, {lessonNo: boss.lessonNo, courseNo: boss.courseNo, bossNo: boss.sentenceNo, type})
      boss.answer = bossAnswer? _.pick(bossAnswer, ['audio', 'type']): bossAnswer;
    })

    res.send({docs: bosses})
  } catch (err) {
    next(err);
  }
})


router.post('/concat', verifySession(), async (req, res, next) => {
  const accountId = req.user._id;
  const {lessonNo, courseNo, type} = req.body;
  try {
    const bossAnswers = await BossAnswer.find({lessonNo, courseNo, accountId, type}).sort({bossNo: 1}).exec()

    const serverIds = [].concat.apply([], _.map(bossAnswers, 'serverIds'))

    const audios = _.map(bossAnswers, 'audio')
    const audio = await homeworkProcessor.concatWechatAudios(serverIds)

    const bossWork = await BossWork.update({lessonNo, courseNo, accountId, type},
      {lessonNo, courseNo, accountId, type, audio, audios, serverIds}, {upsert: true, setDefaultsOnInsert: true}).exec();
    res.send(bossWork);
  } catch (err) {
    next(err);
  }
})


router.get('/work', verifySession(), async (req, res, next) => {
  const accountId = req.user._id;
  const {lessonNo, courseNo, type} = req.query;
  try {
    const bossWork = await BossWork.findOne({lessonNo, courseNo, accountId, type})
    res.send(bossWork);
  } catch (err) {
    next(err);
  }
})

export default router;
