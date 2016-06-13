import polyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import mongoose from 'mongoose';
import Beat from '../models/Beat';
import LearningHistory from '../models/LearningHistory';
import moment from 'moment';
import _ from 'lodash';
import config from '../../config/config';

mongoose.connect(config.mongo) // connect to our database
.connection.on('error', (err) => {
  console.info('connection error:' + JSON.stringify(err));
}).once('open', () => {
  console.info('open mongodb success');
});
const calc = async () => {
  try {
    const todayBeats = await Beat.find({created: {$gt: moment({hour: 0})}});
    const grouped = _.groupBy(todayBeats, 'accountId');
    for (const accountId in grouped) {
      const beats = grouped[accountId];
      const learningHistory = new LearningHistory();
      learningHistory.date = moment({hour: 0});
      learningHistory.accountId = accountId;
      learningHistory.learningTime = beats.length * 0.5;
      await learningHistory.save();
      console.log(learningHistory);
    }
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

calc();
