import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVED_BOSSANSWERS = 'RECEIVED_BOSSANSWERS';
export const TOGGLE_REVIEW_MODAL = 'TOGGLE_REVIEW_MODAL';
export const TOGGLE_METHOD_MODAL = 'TOGGLE_METHOD_MODAL';
export const TOGGLE_FEEDBACK_MODAL = 'TOGGLE_FEEDBACK_MODAL';
export const TOGGLE_COLLECTION_MODAL = 'TOGGLE_COLLECTION_MODAL';
export const COLLECTED_BOSS_ANSWER = 'COLLECTED_BOSS_ANSWER';

// ------------------------------------
// Actions
// ------------------------------------
export const receivedBossAnswers = createAction(RECEIVED_BOSSANSWERS, (payload) => payload);
export const toggleCollectionModal = createAction(TOGGLE_COLLECTION_MODAL, (payload) => payload);
export const toggleReviewModal = createAction(TOGGLE_REVIEW_MODAL, (payload) => payload);
export const toggleMethodModal = createAction(TOGGLE_METHOD_MODAL, (payload) => payload);
export const toggleFeedbackModal = createAction(TOGGLE_FEEDBACK_MODAL, (payload) => payload);
export const collectedBossAnswer = createAction(COLLECTED_BOSS_ANSWER, (payload) => payload);

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

export const toggleCollect = (bossAnswer, type) => {
  return async (dispatch) => {
    const {courseNo, lessonNo, sentenceNo, collected} = bossAnswer;
    try {
      if (collected) {
        const response = await ajax.del('/api/collections/', {courseNo, lessonNo, sentenceNo, type});
      } else {
        const response = await ajax.post('/api/collections/', {courseNo, lessonNo, sentenceNo, type});
      }
      dispatch(collectedBossAnswer(bossAnswer));
    } catch (err) {
      console.remote('redux/bosses 20', err);
    }
  };
};

export const actions = {
  receivedBossAnswers,
  fetchBossAnswersAsync,
  toggleCollectionModal,
  toggleReviewModal,
  toggleMethodModal,
  toggleFeedbackModal,
  toggleCollect,
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
  [COLLECTED_BOSS_ANSWER]: (state, {payload}) => {
    payload.collected = !payload.collected;
    const index = state.docs.indexOf(payload);
    state.docs.splice(index, 1, Object.assign({}, payload));
    return Object.assign({}, state);
  }
}, {docs: []});
