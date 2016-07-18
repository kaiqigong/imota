import {Router} from 'express';
import config from '../../config/config';
import Homework from '../models/Homework';
import wechat from '../../utils/wechat';
import request from '../../utils/request';
import randomstring from 'randomstring';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import homeworkProcessor from './homeworkProcessor';

const router = new Router();

router.get('/:homeworkId', async (req, res, next) => {
  try {
    const homeworkId = req.params.homeworkId;
    const result = await Homework.findOne({_id: homeworkId});
    const course = await Course.findOne({courseNo: result.courseNo});
    const lesson = await Lesson.findOne({courseNo: result.courseNo, lessonNo: result.lessonNo});
    const homework = result.toObject();
    homework.course = course;
    homework.lesson = lesson;
    res.send(homework);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const accountId = req.session.loginAccount && req.session.loginAccount._id;
    const results = await Homework.find(Object.assign({accountId}, req.query));
    res.send(results);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {serverIds, lessonNo, courseNo, nickname, time, type} = req.body;
    const accessToken = await wechat.getAccessToken();
    // download
    const files = [];
    for (let id in serverIds) {
      const file = await homeworkProcessor.downloadFileFromWechat(accessToken, serverIds[id]);
      files.push(file);
    }

    const audios = [];

    for (let id in files) {
      const audio = await homeworkProcessor.uploadFileToQiniu(files[id]);
      audios.push(audio);
    }

    let audio;
    try {
      audio = await homeworkProcessor.concatAudios(files);
    } catch (err) {
      console.log(err);
    }

    if (audio) {
      audio = await homeworkProcessor.uploadFileToQiniu(audio);
    }

    const homework = new Homework({lessonNo, courseNo, nickname, time, serverIds, type, audios, audio, accountId: req.session.loginAccount._id});
    await homework.save();
    res.send(homework);
  } catch (err) {
    next(err);
  }
});

export default router;
