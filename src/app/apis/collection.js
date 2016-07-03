import {Router} from 'express';
import Collection from '../models/Collection';
import {verifySession} from '../middlewares/authChecker';

const router = new Router();

router.get('/', async (req, res, next) => {
  try {
    const query = Object.assign({
      accountId: req.session.loginAccount && req.session.loginAccount._id
    }, req.query);
    const collections = await Collection.find(query);
    res.status(200).json(collections);
  } catch (err) {
    next(err);
  }
});

router.post('/', verifySession(), async (req, res, next) => {
  try {
    console.log(req.body);
    const collection = new Collection(req.body);
    collection.accountId = req.user._id;
    await collection.save();
    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
});

router.delete('/', verifySession(), async (req, res, next) => {
  try {
    const query = Object.assign({
      accountId: req.session.loginAccount && req.session.loginAccount._id
    }, req.query);
    await Collection.remove(query);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', verifySession(), async (req, res, next) => {
  try {
    await Collection.remove({
      _id: req.params.id,
      accountId: req.user._id
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
