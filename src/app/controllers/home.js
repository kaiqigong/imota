import {Router} from 'express';
import {requireLogin} from '../middlewares/authChecker';

const router = new Router();

router.get('/', requireLogin(), async (req, res) => {
  try {
    res.render('index', {});
  } catch (err) {
    res.redirect('/login/');
  }
});

router.get('/iframe', async (req, res) => {
  res.set('Content-Type', 'text/html');
  res.set('Cache-Control', 'public, max-age=604800');
  res.status(200).send('', {maxAge: 604800000});
});

router.get('/home/*', requireLogin(), async (req, res) => {
  try {
    res.render('index', {});
  } catch (err) {
    res.redirect('/login/');
  }
});

export default router;
