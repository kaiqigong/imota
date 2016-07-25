import {Router} from 'express';
import {requireLogin} from '../middlewares/authChecker';

const router = new Router();

router.get('/', requireLogin(), async (req, res) => {
  try {
    res.render('imota', {});
  } catch (err) {
    res.redirect('/login/');
  }
});

router.get('/*', requireLogin(), async (req, res) => {
  try {
    res.render('imota', {});
  } catch (err) {
    res.redirect('/login/');
  }
});

export default router;
