import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_CURRENT_POST = 'SET_CURRENT_POST';
export const RECEIVED_SINGLE_POST = 'RECEIVED_SINGLE_POST';
export const NAME_CHANGED = 'NAME_CHANGED';

// ------------------------------------
// Actions
// ------------------------------------
export const receivedSinglePost = createAction(RECEIVED_SINGLE_POST, (payload) => payload);
export const nameChanged = createAction(NAME_CHANGED, (payload) => payload);
export const fetchSinglePostAsync = (post) => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/posts/' + post);
      dispatch(receivedSinglePost(response));
    } catch (err) {
      console.remote('redux/editor 22', err);
    }
  };
};
export const updatePostAsync = (id, content) => {
  console.log(content);
  return async (dispatch, getState) => {
    try {
      if (content === getState().editor.post.content) {
        return;
      }
      const response = await ajax.put('/api/posts/' + id, {content});
      dispatch(receivedSinglePost(response));
    } catch (err) {
      console.remote('redux/editor 32', err);
    }
  };
};

export const actions = {
  fetchSinglePostAsync,
  nameChanged,
  updatePostAsync,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [RECEIVED_SINGLE_POST]: (state, {payload}) => ({
    ...state,
    post: payload,
  }),
  [NAME_CHANGED]: (state, {payload}) => ({
    ...state,
    post: {
      ...state.post,
      name: payload,
    },
  }),
}, {post: {}});
