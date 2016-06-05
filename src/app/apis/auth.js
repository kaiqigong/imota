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

export default router;
