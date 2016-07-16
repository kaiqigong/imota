import config from '../../config/config';
import qiniu from 'qiniu';
import randomstring from 'randomstring';
const exec = require('child_process').exec;
import wechat from '../../utils/wechat';

const http = require('request');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const qiniuHost = 'http://media.learnwithwind.com';

qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

const FILE_DIR = '/data/files/';

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
      // ffmpeg -i ZV5P9L_vrfzlzPmy3H3BVKPNvioOzBMRCca3i21NHE8X158R9D8-AlDVS7yALeYp.amr -vn -ar 8000 -ac 2 -ab 192k -f mp3 ZV5P9L_vrfzlzPmy3H3BVKPNvioOzBMRCca3i21NHE8X158R9D8-AlDVS7yALeYp.mp3
      const cmd = `ffmpeg -i ${filename} -y -vn -ar 8000 -ac 1 -ab 320k -f mp3 ${outputFilePath}`;
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          console.error(outputFilePath + ' An error occurred Converting : ' , error);
          return reject(error);
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        resolve(outputFilePath);
      });
      // 异步上传amr
      uploadFileToQiniu(filename);
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
    const key = file.substr(1); // remove first '/'
    const putPolicy = new qiniu.rs.PutPolicy(config.qiniu.bucket + ":" + key);
    const uptoken = putPolicy.token();
    const extra = new qiniu.io.PutExtra();
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

const downloadFileFromWechatWithCache = async (accessToken, serverId) => {
  const outputFilePath = FILE_DIR + serverId + '.mp3';
  try {
    fs.accessSync(outputFilePath, fs.F_OK)
  } catch (err) {
    return await downloadFileFromWechat(accessToken, serverId)
  }
  return outputFilePath
}

const concatWechatAudios = async (serverIds) => {
  const accessToken = await wechat.getAccessToken();
  console.log(accessToken);
  // download
  console.log(`http://file.api.weixin.qq.com/cgi-bin/media/get`, {access_token: accessToken, media_id: serverIds});
  const files = [];
  for (let id in serverIds) {
    const file = await downloadFileFromWechatWithCache(accessToken, serverIds[id]);
    files.push(file);
  }
  console.log(files);

  let audio = await concatAudios(files);
  if (audio) {
    audio = await uploadFileToQiniu(audio);
  }
  return audio
}

export default {
  downloadFileFromWechat,
  concatAudios,
  uploadFileToQiniu,
  concatWechatAudios,
}
