import mongoose, {Schema} from 'mongoose';
import BaseSchema from './BaseSchema';
import bcrypt from 'bcrypt-nodejs';
import logger from '../../utils/logger';
import {generateRandomId} from '../../utils/math';

const {ObjectId} = Schema.Types;

const schema = BaseSchema.extend({
  userId: String,
  username: {type: String},
  password: {type: String},
  nickname: {type: String, default: ''},
  sex: {type: Number},
  province: {type: String, default: ''},
  city: {type: String, default: ''},
  country: {type: String, default: ''},
  avatar: {type: String, default: ''},
  mobile: {type: String, default: ''},
  weixinAuth: {
    access_token: String,
    expires_in: Number,
    refresh_token: String,
    openid: String,
    scope: String,
  },
  roles: [String],
});

// methods ======================
// generating a hash
schema.methods.generateHash = (password) => {
  try {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
  } catch (err) {
    logger.fatal(err);
    throw err;
  }
};

// checking if password is valid
schema.methods.validatePassword = function validatePassword(password) {
  try {
    return bcrypt.compareSync(password, this.password);
  } catch (err) {
    logger.fatal(err);
    return false;
  }
};

const Model = mongoose.model('Account', schema);

schema.pre('save', async function genUserId(next) {
  if (!this.userId) {
    let userId;
    let users;
    do {
      userId = 'u' + generateRandomId(9);
      users = await Model.find({userId});
    } while (users && users.length)
    this.userId = userId;
  }
  return next();
});

export default Model;
