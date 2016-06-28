import express from 'express';
import logger from '../utils/logger';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import compress from 'compression';
import methodOverride from 'method-override';
import ejsLocals from 'ejs-locals';
import session from 'express-session';
import connectRedis from 'connect-redis';
import fs from 'fs';
import FileStreamRotator from 'file-stream-rotator';
import mongoose from 'mongoose';
import beat from '../app/middlewares/beat';

const expires = 86400000 * 14;
const RedisStore = connectRedis(session);
export default (app, config) => {
  mongoose.connect(config.mongo) // connect to our database
  .connection.on('error', (err) => {
    logger.info('connection error:' + JSON.stringify(err));
  }).once('open', () => {
    logger.info('open mongodb success');
  });

  const env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env === 'development';
  app.locals.description = 'Wind教口语';
  app.engine('ejs', ejsLocals);
  app.set('views', config.root + '/app/views');
  app.set('view engine', 'ejs');
  app.locals._layoutFile = 'layout.ejs';
  app.use(favicon(config.root + '/public/img/favicon.ico'));

  app.use(morgan('dev'));

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true,
  }));
  app.use(cookieParser());
  app.use(compress());
  app.use(session({
    secret: config.sessionSecret,
    cookie: {maxAge: expires},
    store: new RedisStore({
      port: config.redis.port,
      host: config.redis.host,
      db: config.redis.db,
      ttl: expires / 1000 + 10,
    }),
    resave: false,
    saveUninitialized: true,
  }));
  if (env === 'production') {
    app.use(express.static(config.root + '/public', {maxAge: expires}));
  } else {
    app.use(express.static(config.root + '/public'));
  }
  app.use(methodOverride());

  app.use(beat);

  app.use((req, res, next) => {
    if (/\/test\/account\/weixin\//.test(req.url)) {
      return res.redirect(301, 'http://test.holdqq.com' + req.url.replace('/test', ''));
    }
    return next();
  });

  // api 路由定义
  app.use('/api/auth/', require('../app/apis/auth'));
  app.use('/api/courses/', require('../app/apis/course'));
  app.use('/api/lessons/', require('../app/apis/lesson'));
  app.use('/api/sentences/', require('../app/apis/sentence'));
  app.use('/api/bosses/', require('../app/apis/boss'));
  app.use('/api/boss_answers/', require('../app/apis/bossAnswer'));
  app.use('/api/homeworks/', require('../app/apis/homework'));
  app.use('/api/wechat/', require('../app/apis/wechat'));
  app.use('/api/stats/', require('../app/apis/stats'));
  app.use('/api/pronunciation_courses/', require('../app/apis/pronunciationCourse'));
  app.use('/api/pronunciation_homeworks/', require('../app/apis/pronunciationHomework'));
  app.use('/api/behaviors/', require('../app/apis/behavior'));


  // 页面路由定义
  app.use('/', require('../app/controllers/home'));
  app.use('/account', require('../app/controllers/account'));


  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  var omitDeep = function(obj, key, depth) {
    for (var k in obj) {
      if (k == key) {
        delete obj[k];
      } else if (typeof(obj[k]) == 'object' && depth > 1) {
        omitDeep(obj[k], key, depth - 1);
      }
    }
  }
  app.use((err, req, res, next) => {  // eslint-disable-line no-unused-vars
    res.status(err.status || 500);
    const locals = Object.assign({message: err.message}, {
      error: err,
      title: 'error',
      code: err.code,
    });
    res.json(locals);
    omitDeep(err, 'password', 5);
    logger.error(err);
  });
};
