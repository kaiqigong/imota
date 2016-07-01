import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';
import unionBy from 'lodash/unionBy';
// ------------------------------------
// Constants
// ------------------------------------
export const LEARNING_HISTORIES_INIT = 'LEARNING_HISTORIES_INIT';
export const RECEIVED_LEARNING_HISTORIES = 'RECEIVED_LEARNING_HISTORIES';
export const RECEIVED_MORE_LEARNING_HISTORIES = 'RECEIVED_MORE_LEARNING_HISTORIES';
// ------------------------------------
// Actions
// ------------------------------------
export const learningHistoriesInit = createAction(LEARNING_HISTORIES_INIT);
export const receivedLearningHistories = createAction(RECEIVED_LEARNING_HISTORIES, (payload) => payload);
export const receivedMoreLearningHistories = createAction(RECEIVED_MORE_LEARNING_HISTORIES, (payload) => payload);

export const fetchLearningHistoriesAsync = () => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/stats/learning_histories/', {page: 1});
      dispatch(receivedLearningHistories(response));
    } catch (err) {
      console.remote('redux/learningHistories 21', err);
    }
  };
};

export const fetchMoreLearningHistoriesAsync = (page) => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/stats/learning_histories/', {page});
      dispatch(receivedMoreLearningHistories(response));
    } catch (err) {
      console.remote(err);
    }
  };
};

export const actions = {
  learningHistoriesInit,
  receivedLearningHistories,
  receivedMoreLearningHistories,
  fetchLearningHistoriesAsync,
  fetchMoreLearningHistoriesAsync,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [LEARNING_HISTORIES_INIT]: () => {
    return {docs: [], loading: true};
  },
  [RECEIVED_LEARNING_HISTORIES]: (state, {payload}) => {
    return payload;
  },
  [RECEIVED_MORE_LEARNING_HISTORIES]: (state, {payload}) => {
    const {docs, total} = payload;
    state.total = total;
    state.docs = unionBy(state.docs, docs, '_id');
    return Object.assign({}, state);
  },
}, {docs: [], loading: true});
