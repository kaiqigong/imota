import calcLearningTimeOf from './calcLearningTimeOf';
import moment from 'moment';

const dateStr = process.argv[2];

const fromDate = new moment(dateStr);
const now = new moment();

let curr = fromDate;

const calc = async () => {
  while(curr.valueOf() < now.valueOf()) {
    await calcLearningTimeOf(new moment(curr));
    curr = curr.add(1, 'day');
  }
}
calc();
