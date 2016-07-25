import {combineReducers} from 'redux';
import auth from './auth';
import categories from './categories';
import currentCategory from './currentCategory';
import posts from './posts';
import currentPost from './currentPost';

export default combineReducers({
  auth, categories, currentCategory,
  posts, currentPost
});
