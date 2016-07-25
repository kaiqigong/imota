import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_CURRENT_POST = 'SET_CURRENT_POST';

// ------------------------------------
// Actions
// ------------------------------------
export const setCurrentPost = createAction(SET_CURRENT_POST, (payload) => payload);

export const actions = {
  setCurrentPost,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [SET_CURRENT_POST]: (state, {payload}) => payload,
}, {});
