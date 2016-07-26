import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';
import unionBy from 'lodash/unionBy';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVED_POSTS = 'RECEIVED_POSTS';
export const RECEIVED_MORE_POSTS = 'RECEIVED_MORE_POSTS';
export const REMOVED_POST = 'REMOVED_POST';
export const POST_INIT = 'POST_INIT';

// ------------------------------------
// Actions
// ------------------------------------
export const receivedPosts = createAction(RECEIVED_POSTS, (payload) => payload);
export const receivedMorePosts = createAction(RECEIVED_MORE_POSTS, (payload) => payload);
export const removedPost = createAction(REMOVED_POST, (payload) => payload);
export const postsInit = createAction(POST_INIT);
export const fetchPostsAsync = (category) => {
  return async (dispatch) => {
    try {
      const query = category ? {page: 1, category} : {page: 1}
      const response = await ajax.get('/api/posts/', query);
      dispatch(receivedPosts(response));
    } catch (err) {
      console.remote('redux/posts 22', err);
    }
  };
};

export const fetchMorePostsAsync = (page, category) => {
  return async (dispatch) => {
    try {
      const query = category ? {page, category} : {page}
      const response = await ajax.get('/api/posts/', query);
      dispatch(receivedMorePosts(response));
    } catch (err) {
      console.remote('redux/posts 33', err);
    }
  };
};

export const createPostAsync = (category) => {
  return async (dispatch) => {
    try {
      const response = await ajax.post('/api/posts/', {category});
      dispatch(receivedMorePosts(response));
    } catch (err) {
      console.remote('redux/posts 44', err);
    }
  };
};

export const removePostAsync = (post) => {
  return async (dispatch) => {
    try {
      const response = await ajax.del('/api/posts/' + post._id);
      dispatch(removedPost(post._id));
    } catch (err) {
      console.remote('redux/posts 44', err);
    }
  };
};

export const actions = {
  receivedPosts,
  receivedMorePosts,
  fetchPostsAsync,
  fetchMorePostsAsync,
  createPostAsync,
  removePostAsync,
  postsInit,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [RECEIVED_POSTS]: (state, {payload}) => {
    return {...payload};
  },
  [RECEIVED_MORE_POSTS]: (state, {payload}) => ({
    ...state,
    ...payload,
    docs: unionBy(state.docs, payload.docs, '_id'),
  }),
  [REMOVED_POST]: (state, {payload}) => ({
    ...state,
    total: state.total - 1,
    docs: state.docs.filter((item) => item._id !== payload),
  }),
  [POST_INIT]: (state) => ({
    ...state,
    docs: [],
  })
}, {docs: []});
