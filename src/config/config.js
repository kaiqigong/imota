import path from 'path';
const rootPath = path.normalize(__dirname + '/..');
const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    root: rootPath,
    qiniu: {
      ACCESS_KEY: '07cMjNhILyyOUOy4mes6SWwuwRnytDqrb6Zdlq0U',
      SECRET_KEY: 'NvlDby_4PcpNdWRfyzb5pli2y9mjquzC6Rv2GDnx',
      bucket: 'scott',
      prefix: 'https://o3f47rda5.qnssl.com/',
    },
    pagination: {
      defaultSize: 10,
      maxSize: 100,
    },
    app: {
      name: 'wind',
    },
    port: 8000,
    mongo: 'mongodb://localhost:27018/wind-cms-dev',
    sessionSecret: 'wind-dev',
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 3,
    },
    apiRoot: 'http://123.57.72.210:9002/dtp/',
    cookieSecret: 'dsfljkasdjfklsdajfkl',
    rsa: {
      encoding: 'base64',
      privatePem: 'server.pem',
      charset: 'utf8',
    },
    cookieExpire: 7 * 24 * 3600 * 1000, // 7天
    cookieDomain: '.learnwithwind.com',
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
      bucket: 'scott',
      prefix: 'https://o3f47rda5.qnssl.com/',
    },
    pagination: {
      defaultSize: 10,
      maxSize: 100,
    },
    app: {
      name: 'wind',
    },
    port: 8001,
    mongo: 'mongodb://localhost/wind-cms',
    sessionSecret: 'wind-dev',
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
    },
    apiRoot: 'http://123.57.72.210:9002/dtp/',
    cookieSecret: 'dsfljkasdjfklsdajfkl',
    rsa: {
      encoding: 'base64',
      privatePem: 'server.pem',
      charset: 'utf8',
    },
    cookieExpire: 7 * 24 * 3600 * 1000, // 7天
    cookieDomain: '.learnwithwind.com',
    host: 'test.holdqq.com',
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
      bucket: 'scott',
      prefix: 'https://o3f47rda5.qnssl.com/',
    },
    pagination: {
      defaultSize: 10,
      maxSize: 100,
    },
    app: {
      name: 'wind',
    },
    logPath: '/data/',
    port: 8002,
    mongo: 'mongodb://localhost/wind-cms',
    sessionSecret: 'wind-prod',
    redis: {
      host: '127.0.0.1',
      port: 6379,
      db: 0,
    },
    apiRoot: 'http://123.57.72.210:9002/dtp/',
    cookieSecret: 'dsfljkasdjfklsdajfkl',
    rsa: {
      encoding: 'base64',
      privatePem: 'server.pem',
      charset: 'utf8',
    },
    cookieExpire: 7 * 24 * 3600 * 1000, // 7天
    cookieDomain: '.learnwithwind.com',
    host: 'www.holdqq.com',
    weixin: {
      appid: 'wx453346560ed6a84e',
      secret: '2e1364c00766952f641b197b67dd3b9c',
    },
  },
};

export default config[env];
