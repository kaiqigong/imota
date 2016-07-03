import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';
import history from '../common/history';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVED_BOSSANSWERS = 'RECEIVED_BOSSANSWERS';
export const TOGGLE_REVIEW_MODAL = 'TOGGLE_REVIEW_MODAL';
export const TOGGLE_METHOD_MODAL = 'TOGGLE_METHOD_MODAL';
export const TOGGLE_FEEDBACK_MODAL = 'TOGGLE_FEEDBACK_MODAL';
export const TOGGLE_COLLECTION_MODAL = 'TOGGLE_COLLECTION_MODAL';
// ------------------------------------
// Actions
// ------------------------------------
export const receivedBossAnswers = createAction(RECEIVED_BOSSANSWERS, (payload) => payload);
export const toggleCollectionModal = createAction(TOGGLE_COLLECTION_MODAL, (payload) => payload);
export const toggleReviewModal = createAction(TOGGLE_REVIEW_MODAL, (payload) => payload);
export const toggleMethodModal = createAction(TOGGLE_METHOD_MODAL, (payload) => payload);
export const toggleFeedbackModal = createAction(TOGGLE_FEEDBACK_MODAL, (payload) => payload);

export const fetchBossAnswersAsync = (courseNo, lessonNo, type) => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/boss_answers/', {courseNo, lessonNo, type});
      dispatch(receivedBossAnswers(response));
    } catch (err) {
      console.remote('redux/bosses 20', err);
    }
  };
};

export const submitWorksAsync = (courseNo, lessonNo, type) => {
  return async (dispatch) => {
    try {
      const response = await ajax.post('/api/boss_answers/concat', {courseNo, lessonNo, type});
      history.pushState(null, `/home/courses/${courseNo}/lessons/${lessonNo}/boss_work?type=${type}`)
    } catch (err) {
      console.remote('redux/bosses 21', err);
    }
  };
}

export const actions = {
  receivedBossAnswers,
  fetchBossAnswersAsync,
  submitWorksAsync,
  toggleCollectionModal,
  toggleReviewModal,
  toggleMethodModal,
  toggleFeedbackModal,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [RECEIVED_BOSSANSWERS]: (state, {payload}) => {
    console.log(payload);
    return payload;
  },
  [TOGGLE_COLLECTION_MODAL]: (state, {payload}) => {
    state.showCollectionModal = payload;
    return Object.assign({}, state);
  },
  [TOGGLE_REVIEW_MODAL]: (state, {payload}) => {
    state.showReviewModal = payload;
    return Object.assign({}, state);
  },
  [TOGGLE_METHOD_MODAL]: (state, {payload}) => {
    state.showMethodModal = payload;
    return Object.assign({}, state);
  },
  [TOGGLE_FEEDBACK_MODAL]: (state, {payload}) => {
    state.showFeedbackModal = payload;
    return Object.assign({}, state);
  },
}, {docs: []});
