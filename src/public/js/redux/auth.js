import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';

// ------------------------------------
// Constants
// ------------------------------------
export const AUTH_ERRORS = 'AUTH_ERRORS';
export const AUTH_INIT = 'AUTH_INIT';
export const RECEIVED_ME = 'RECEIVED_ME';

// ------------------------------------
// Actions
// ------------------------------------
export const displayErrors = createAction(AUTH_ERRORS, (payload) => payload);
export const authInit = createAction(AUTH_INIT);
export const receivedMe = createAction(RECEIVED_ME, (payload) => payload);
export const fetchMeAsync = () => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/auth/me/');
      dispatch(receivedMe(response));
    } catch (err) {
      console.remote('redux/auth 23', err);
    }
  };
};

export const actions = {
  displayErrors,
  authInit,
  fetchMeAsync,
  receivedMe,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [AUTH_ERRORS]: (state, {payload}) => {
    state.errors = payload;
    return Object.assign({}, state);
  },
  [AUTH_INIT]: () => {
    return {errors: {}};
  },
  [RECEIVED_ME]: (state, {payload}) => {
    return Object.assign(state, payload);
  },
}, {errors: {}});
