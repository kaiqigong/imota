import config from '../../config/config';
import qiniu from 'qiniu';
import randomstring from 'randomstring';
const exec = require('child_process').exec;

const http = require('request');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const qiniuHost = 'https://o3f47rda5.qnssl.com';

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

const FILE_DIR = '/data/files/'

const downloadFileFromWechat = async (accessToken, serverId) => {
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
        resolve(outputFilePath);
      })
      .save(outputFilePath);
    });
  });
};

const concatAudios = async (audios) => {
  // ffmpeg -i "concat:1_76_audio.mp3|2_15_audio.mp3" -c copy output_1.mp3
  const pipeStr = audios.join('|');
  const randomStr = randomstring.generate(12);
  const outputPath = FILE_DIR + 'records-' + randomStr + '.mp3';
  const cmd = `ffmpeg -i "concat:${pipeStr}" -c copy ${outputPath}`;
  return new Promise(function(resolve, reject) {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return reject(error);
      }
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
      resolve(outputPath);
    });
  });
};

const uploadFileToQiniu = async (file) => {
  return new Promise(function(resolve, reject) {
    // upload
    const putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket);
    const uptoken = putPolicy.token();
    const extra = new qiniu.io.PutExtra();
    const key = file.substr(1); // remove first '/'
    qiniu.io.putFile(uptoken,
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
  concatAudios,
  uploadFileToQiniu,
}
