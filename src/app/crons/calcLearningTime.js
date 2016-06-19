import polyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import mongoose from 'mongoose';
import Beat from '../models/Beat';
import LearningHistory from '../models/LearningHistory';
import moment from 'moment';
import _ from 'lodash';
import config from '../../config/config';
import Account from '../models/Account';
import Homework from '../models/Homework';
import PronunciationHomework from '../models/PronunciationHomework';

mongoose.connect(config.mongo) // connect to our database
.connection.on('error', (err) => {
  console.info('connection error:' + JSON.stringify(err));
}).once('open', () => {
  console.info('open mongodb success');
});
const calc = async () => {
  try {
    const date = moment().add(-1, 'day').set({hour: 0, minute: 0, second: 0, millisecond: 0});
    console.log('*** 开始计算学习时间 ***');
    const todayBeats = await Beat.find({created: {$gt: date}}).sort({created: 1}).exec();
    const grouped = _.groupBy(todayBeats, 'accountId');
    for (const accountId in grouped) {
      const beats = grouped[accountId];
      const learningHistory = new LearningHistory();
      learningHistory.date = date;

      // account info
      learningHistory.accountId = accountId;
      const account = await Account.find({_id: accountId});
      if (Account) {
        learningHistory.nickname = account.nickname;
        learningHistory.classe = account.classe;
      }

      await learningHistory.save();

      // homework
      const homeworks = await Homework.find({
        accountId,
        created: {$gt: date}
      });
      homeworks.forEach(function(homework) {
        homework.learningHistory = learningHistory._id;
        homework.save();
      });

      const pronunciationHomeworks = await PronunciationHomework.find({
        accountId,
        created: {$gt: date}
      });
      pronunciationHomeworks.forEach(function(pronunciationHomework) {
        pronunciationHomework.learningHistory = learningHistory._id;
        pronunciationHomework.save();
      });

      learningHistory.todayHomeworkCount = homeworks.length + pronunciationHomeworks.length;

      // learning time
      let learningTime = 0; // Milliseconds
      let lastLearningStart = 0; // Milliseconds
      beats.forEach((beat) => {
        const dur = beat.created.valueOf() - lastLearningStart;
        if (dur <= 1000 * 60) {
          learningTime += dur;
        } else {
          learningTime += 1000 * 10;
        }
        lastLearningStart = beat.created.valueOf();
      });
      learningHistory.learningTime = learningTime / 1000 / 60;
      console.log(learningHistory);
      const lastLearningHistory = await LearningHistory.findOne({accountId}).sort({created: -1}).exec();
      if (lastLearningHistory && lastLearningHistory.totalLearningTime) {
        learningHistory.totalLearningTime = lastLearningHistory.totalLearningTime + learningHistory.learningTime;
      } else {
        learningHistory.totalLearningTime = learningHistory.learningTime;
      }

      await learningHistory.save();
    }
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

calc();
