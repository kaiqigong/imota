import path from 'path';
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    qiniu: {
      ACCESS_KEY: '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U',
      SECRET_KEY: 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx',
      bucket: 'imota',
      prefix: 'https://o3f47rda5.qnssl.com/',
    },
    pagination: {
      defaultSize: 10,
      maxSize: 100,
    },
    app: {
      name: 'imota',
    },
    port: process.env.PORT || 8000,
    mongo: 'mongodb://localhost:27017/imota-cms',
    sessionSecret: 'imota-dev',
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
    },
    cookieSecret: 'qwerasdfzxvc',
    rsa: {
      encoding: 'base64',
      privatePem: 'server.pem',
      charset: 'utf8',
    },
    cookieExpire: 7 * 24 * 3600 * 1000, // 7天
    cookieDomain: '',
    host: 'test.holdqq.com',
    weixin: {
      appid: 'wx453346560ed6a84e',
      secret: '2e1364c00766952f641b197b67dd3b9c',
    },
  },

  test: {
    root: rootPath,
    qiniu: {
      ACCESS_KEY: '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U',
      SECRET_KEY: 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx',
      bucket: 'imota',
      prefix: 'https://o3f47rda5.qnssl.com/',
    },
    pagination: {
      defaultSize: 10,
      maxSize: 100,
    },
    app: {
      name: 'imota',
    },
    port: 8001,
    mongo: 'mongodb://localhost/imota-cms',
    sessionSecret: 'imota-dev',
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
    },
    cookieSecret: 'qwerasdfzxvc',
    rsa: {
      encoding: 'base64',
      privatePem: 'server.pem',
      charset: 'utf8',
    },
    cookieExpire: 7 * 24 * 3600 * 1000, // 7天
    cookieDomain: '',
    host: 'imota.com/test',
    weixin: {
      appid: 'wx453346560ed6a84e',
      secret: '2e1364c00766952f641b197b67dd3b9c',
    },
  },

  production: {
    root: rootPath,
    qiniu: {
      ACCESS_KEY: '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U',
      SECRET_KEY: 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx',
      bucket: 'imota',
      prefix: 'https://o3f47rda5.qnssl.com/',
    },
    pagination: {
      defaultSize: 10,
      maxSize: 100,
    },
    app: {
      name: 'imota',
    },
    logPath: '/data/',
    port: 8002,
    mongo: 'mongodb://localhost/imota-cms',
    sessionSecret: 'imota-prod',
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
    },
    cookieSecret: 'qwerasdfzxvc',
    rsa: {
      encoding: 'base64',
      privatePem: 'server.pem',
      charset: 'utf8',
    },
    cookieExpire: 7 * 24 * 3600 * 1000, // 7天
    cookieDomain: '',
    host: 'imota.com',
    weixin: {
      appid: 'wx453346560ed6a84e',
      secret: '2e1364c00766952f641b197b67dd3b9c',
    },
  },
};

export default config[env];
