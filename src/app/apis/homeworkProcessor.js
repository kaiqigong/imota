import qiniu from 'qiniu';
const http = require('request');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const qiniuHost = 'https://o3f47rda5.qnssl.com';

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

const FILE_DIR = '/data/files/'

const downloadFile = async (accessToken, serverId) => {
  return new Promise(function(resolve, reject) {
    let filename = FILE_DIR + serverId + '.amr';
    let stream = http(`http://file.api.weixin.qq.com/cgi-bin/media/get?access_token=${encodeURIComponent(accessToken)}&media_id=${encodeURIComponent(serverId)}`)
      .on('error', (err) => {
        reject(err);
      })
      .pipe(fs.createWriteStream(filename))
      .on('error', (err) => {
        reject(err);
      });

    stream.on('finish', () => {
      console.log(`finish download: ${filename}`);
      const outputFilePath = FILE_DIR + serverId + '.mp3';
      ffmpeg(filename)
      .format('mp3')
      .on('error', function(err) {
        console.log(outputFilePath + ' An error occurred Converting : ' + err.message);
        reject(err);
      })
      .on('end', function() {
        console.log(outputFilePath + ' Converting finished !');
        resolve(filename);
      })
      .save(outputFilePath);
    });
  });
};

const uploadFile = async (file) => {
  return new Promise(function(resolve, reject) {
    // upload
    const putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket);
    const uptoken = putPolicy.token();
    const extra = new qiniu.io.PutExtra();
    const key = file.substr(1); // remove first '/'
    qiniu.io.put(uptoken,
      key,
      file,
      extra,
      (err, ret) => {
        if (err) {
          return reject(err);
        }
        return resolve(qiniuHost + '/' + key);
      }
    );
  });
};

export default {
  downloadFileFromWechat,
  uploadFileToQiniu
}
