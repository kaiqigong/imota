import Beat from '../models/Beat';

export default (req, res, next) => {
  if (req.session.loginAccount) {
    const beat = new Beat();
    beat.accountId = req.session.loginAccount._id;
    beat.url = req.url;
    beat.save();
  }
  return next();
};
