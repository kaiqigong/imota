import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';

// ------------------------------------
// Constants
// ------------------------------------
export const SET_CURRENT_CATEGORY = 'SET_CURRENT_CATEGORY';

// ------------------------------------
// Actions
// ------------------------------------
export const setCurrentCategory = createAction(SET_CURRENT_CATEGORY, (payload) => payload);

export const actions = {
  setCurrentCategory,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [SET_CURRENT_CATEGORY]: (state, {payload}) => payload,
}, {});
