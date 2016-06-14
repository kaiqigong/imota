import polyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import homeworkProcessor from './apis/homeworkProcessor';

homeworkProcessor.uploadFileToQiniu(process.argv[2]).then(function(data) {
  console.log('uploaded: ', data);
  process.exit(1);
}, function(err) {
  console.log('fail: ', err);
  process.exit(0);
});
