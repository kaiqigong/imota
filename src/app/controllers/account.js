import { Router } from 'express';
import Account from '../models/Account';
import {MOBILE_REG, EMAIL_REG} from '../../common/regex';
import randomstring from 'randomstring';
import config from '../../config/config';
import request from '../../utils/request';
import {requireLogin} from '../middlewares/authChecker';

const router = new Router();

router.get('/register/', async (req, res, next) => {
  try {
    const loginRedirect = req.query.r ? req.query.r : '';
    if (req.query.hasOwnProperty('r')) {
      req.session.loginRedirect = loginRedirect || '';
    }
    const newAccount = new Account();
    newAccount.username = '';
    newAccount.password = '';
    res.render('register', {errors: {}, vm: newAccount});
  } catch (err) {
    next(err);
  }
});

router.post('/register/', async (req, res, next) => {
  let {username, password} = req.body;
  username = username.trim();
  password = password.trim();
  const errors = {};
  let valid = true;
  // check password and username
  if (!username) {
    errors.username = '请输入手机号';
    valid = false;
  } else if (!MOBILE_REG.test(username)) {
    errors.username = '手机号格式不正确'
    valid = false;
  }
  if (!password) {
    errors.password = '请输入密码';
    valid = false;
  }
  if (!valid) {
    return res.render('register', {vm: req.body, errors});
  }

  // find a user whose username is the same as the forms username
  const existed = await Account.findOne({'username': username});
  if (existed) {
    errors.username = '手机号已存在';
    return res.status(400).render('register', {vm: req.body, errors});
  }
  // create the user
  const newAccount = new Account();

  // set the user's local credentials
  newAccount.username = username;
  newAccount.password = newAccount.generateHash(password);
  newAccount.nickname = '游客' + randomstring.generate(6);
  // save the user
  try {
    await newAccount.save();
    req.session.loginAccount = newAccount;
    res.redirect(req.session.loginRedirect || '/');
  } catch (dbErr) {
    return next(dbErr);
  }
});

// https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect

const generateWechatAuthUrl = (state) => {
  const result = `https://open.weixin.qq.com/connect/oauth2/authorize?
  appid=${config.weixin.appid}&
  redirect_uri=${encodeURIComponent('http://' + config.host + '/account/weixin/')}&
  response_type=code&scope=snsapi_userinfo&state=${state}#wechat_redirect`;
  return result;
}

router.get('/weixin/', async (req, res, next) => {
  try {
    const {code} = req.query;
    console.log('code: ', code);
    const result = await request.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
      'appid': config.weixin.appid,
      'secret': config.weixin.secret,
      code,
      'grant_type': 'authorization_code',
    });
    // https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
    console.log('code: ', result);
    // find user, if no, create one
    let existed = await Account.findOne({'weixinAuth.openid': result.openid});
    if (!existed) {
      // 创建用户，并且从微信中取用户数据
      const weixinAccount = await request.get('https://api.weixin.qq.com/sns/userinfo', {
        'access_token': result.access_token,
        'openid': result.openid,
        'lang': 'zh_CN',
      });
      console.log(weixinAccount);
      existed = new Account();
      // 初始化数据
      existed.nickname = weixinAccount.nickname;
      existed.sex = weixinAccount.sex;
      existed.province = weixinAccount.province;
      existed.city = weixinAccount.city;
      existed.country = weixinAccount.country;
      existed.avatar = weixinAccount.headimgurl;
    }
    existed.weixinAuth = result;
    await existed.save();
    console.log(existed);
    req.session.loginAccount = existed;
    res.redirect(req.session.loginRedirect || '/');
  } catch (err) {
    next(err);
  }
});

router.get('/login/', async (req, res, next) => {
  try {
    const loginRedirect = req.query.r ? req.query.r : '';
    if (req.query.hasOwnProperty('r')) {
      req.session.loginRedirect = loginRedirect || '';
    }
    console.log(req.headers['user-agent']);
    if (req.headers['user-agent'].indexOf('MicroMessenger') > -1) {
      // 微信登录跳转
      return res.redirect(generateWechatAuthUrl('login'));
    } else {
      return res.render('login', {errors: {}, vm: {username: '', password: ''}});
    }
  } catch (err) {
    next(err);
  }
});

router.post('/login/', async (req, res, next) => {
  let {username, password} = req.body;
  username = username.trim();
  password = password.trim();
  const errors = {};
  let valid = true;

  // check password and username
  if (!username) {
    errors.username = '请输入手机号';
    valid = false;
  }
  if (!password) {
    errors.password = '请输入密码';
    valid = false;
  }
  if (!valid) {
    return res.render('login', {vm: req.body, errors});
  }

  // find a user whose username is the same as the forms username
  const existed = await Account.findOne({'username': username});
  if (!existed) {
    errors.username = '账号不存在';
    return res.render('login', {vm: req.body, errors});
  } else if (!existed.validatePassword(password)) {
    errors.username = '用户名或密码错误';
    return res.render('login', {vm: req.body, errors});
  }
  // login success
  req.session.loginAccount = existed;
  res.redirect(req.session.loginRedirect || '/');
});

router.get('/logout/', requireLogin(), async (req, res, next) => {
  try {
    const redirect = req.session.logoutRedirect || req.query.r || req.headers.referer || '/';
    req.session.loginAccount = null;
    res.redirect(redirect);
  } catch (err) {
    next(err);
  }
});

router.get('/me/', requireLogin(), async (req, res, next) => {
  try {
    res.render('profile', {vm: req.user, errors: {}});
  } catch (err) {
    next(err);
  }
});

router.post('/me/', requireLogin(), async (req, res, next) => {
  try {
    const existed = await Account.findOne({_id: req.user._id});
    if (req.body.username != existed.username) {
      const errors = {};
      let valid = true;
      let username = req.body.username.trim();
      if (!username) {
        errors.username = '请输入手机号';
        valid = false;
      } else if (!MOBILE_REG.test(username)) {
        errors.username = '手机号格式不正确'
        valid = false;
      }
      const other = await Account.findOne({'username': username});
      if (other) {
        errors.username = '手机号已存在';
        valid = false;
      }
      if (!valid) {
        return res.render('profile', {vm: req.body, errors});
      } else {
        existed.username = username;
      }
    }
    existed.nickname = req.body.nickname;
    existed.sex = req.body.sex;
    existed.country = req.body.country;
    existed.province = req.body.province;
    existed.city = req.body.city;
    await existed.save();
    req.session.loginAccount = existed;
    res.redirect('/account/me/');
  } catch (err) {
    next(err);
  }
});

export default router;
