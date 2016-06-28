import {Router} from 'express';
import config from '../../config/config';
import BossAnswer from '../models/BossAnswer';
import Sentence from '../models/Sentence';
import wechat from '../../utils/wechat';
import request from '../../utils/request';
import randomstring from 'randomstring';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import homeworkProcessor from './homeworkProcessor';
import {requireLogin} from '../middlewares/authChecker';
import _ from 'lodash';

const router = new Router();

router.post('/', requireLogin(), async (req, res, next) => {
  try {
    const {serverIds, lessonNo, courseNo, bossNo, type} = req.body;
    const userId = req.user.userId;
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

    const bossAnswer = await BossAnswer.update({lessonNo, courseNo, bossNo, userId, type},
      {lessonNo, courseNo, bossNo, userId, audio, audios, type}, {upsert: true, setDefaultsOnInsert: true}).exec();
    res.send(bossAnswer);
  } catch (err) {
    next(err);
  }
});


router.get('/', requireLogin(), async (req, res, next) => {
  const userId = req.user.userId;
  const {lessonNo, courseNo, type} = req.query; // TODO: type?
  try {
    const bosses = await Sentence.find({lessonNo, courseNo}).sort({sentenceNo: 1}).lean().exec()
    const bossAnswers = await BossAnswer.find({lessonNo, courseNo, userId}).sort({bossNo: 1}).exec()

    bosses.forEach(boss => {
      const bossAnswer = _.find(bossAnswers, {lessonNo: boss.lessonNo, courseNo: boss.courseNo, bossNo: boss.sentenceNo, type})
      boss.answer = bossAnswer? _.pick(bossAnswer, ['audio', 'type']): bossAnswer;
    })

    res.send({docs: bosses})
  } catch (err) {
    next(err);
  }
})

export default router;
