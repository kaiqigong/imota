import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';
import history from '../common/history';

// ------------------------------------
// Constants
// ------------------------------------
export const HOMEWORK_ERRORS = 'HOMEWORK_ERRORS';
export const HOMEWORK_INIT = 'HOMEWORK_INIT';
export const RECEIVED_SINGLE_HOMEWORK = 'RECEIVED_SINGLE_HOMEWORK';
export const TOGGLE_PLAY = 'TOGGLE_PLAY';

// ------------------------------------
// Actions
// ------------------------------------
export const displayErrors = createAction(HOMEWORK_ERRORS, (payload) => payload);
export const homeworkInit = createAction(HOMEWORK_INIT);
export const receivedSingleHomework = createAction(RECEIVED_SINGLE_HOMEWORK, (payload) => payload);
export const togglePlay = createAction(TOGGLE_PLAY, (payload) => payload);
export const fetchSingleHomeworkAsync = (...args) => {
  if (args.length > 1) {
    console.log(args);
    return async (dispatch) => {
      try {
        const response = await ajax.get('/api/homeworks', {
          courseNo: args[0], lessonNo: args[1], type: args[2]});
        if (response[0] && response[0]._id) {
          history.pushState(null, `/home/homeworks/${response[0]._id}`);
        } else {
          console.log('redux/homework 29', args);
        }
      } catch (err) {
        console.remote('redux/homework 32', err);
      }
    };
  }
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/homeworks/' + args[0]);
      dispatch(receivedSingleHomework(response));
    } catch (err) {
      console.remote('redux/homework 25', err);
    }
  };
};

export const actions = {
  displayErrors,
  homeworkInit,
  fetchSingleHomeworkAsync,
  receivedSingleHomework,
  togglePlay,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [HOMEWORK_ERRORS]: (state, {payload}) => {
    state.errors = payload;
    return Object.assign({}, state);
  },
  [HOMEWORK_INIT]: () => {
    return {errors: {}, playing: {}};
  },
  [RECEIVED_SINGLE_HOMEWORK]: (state, {payload}) => {
    return Object.assign(state, payload);
  },
  [TOGGLE_PLAY]: (state, {payload}) => {
    state.playing = payload;
    return Object.assign({}, state);
  },
}, {errors: {}, playing: {}});
