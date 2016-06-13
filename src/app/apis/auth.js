import {Router} from 'express';
const router = new Router();

router.get('/me/', async (req, res, next) => {
  try {
    if (req.session.loginAccount) {
      return res.status(200).json(req.session.loginAccount);
    }
    res.send(401);
  } catch (err) {
    next(err);
  }
});

router.get('/mobile_code/', async (req, res, next) => {
  try {
    return res.sendStatus(501);
  } catch (err) {
    next(err);
  }
});

router.post('/forgot/', async (req, res, next) => {
  try {
    return res.sendStatus(501);
  } catch (err) {
    next(err);
  }
});

export default router;
