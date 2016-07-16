import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVED_BOSSES = 'RECEIVED_BOSSES';
export const TOGGLE_REVIEW_MODAL = 'TOGGLE_REVIEW_MODAL';
export const TOGGLE_METHOD_MODAL = 'TOGGLE_METHOD_MODAL';
export const TOGGLE_FEEDBACK_MODAL = 'TOGGLE_FEEDBACK_MODAL';
export const TOGGLE_COLLECTION_MODAL = 'TOGGLE_COLLECTION_MODAL';
export const DISPLAY_ERRORS = 'DISPLAY_ERRORS';

// ------------------------------------
// Actions
// ------------------------------------
export const receivedBosses = createAction(RECEIVED_BOSSES, (payload) => payload);
export const toggleCollectionModal = createAction(TOGGLE_COLLECTION_MODAL, (payload) => payload);
export const toggleReviewModal = createAction(TOGGLE_REVIEW_MODAL, (payload) => payload);
export const toggleMethodModal = createAction(TOGGLE_METHOD_MODAL, (payload) => payload);
export const toggleFeedbackModal = createAction(TOGGLE_FEEDBACK_MODAL, (payload) => payload);
export const displayErrors = createAction(DISPLAY_ERRORS, (payload) => payload);
export const fetchBossesAsync = (courseNo, lessonNo) => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/bosses/', {courseNo, lessonNo});
      dispatch(receivedBosses(response));
    } catch (err) {
      console.remote('redux/bosses 20', err);
    }
  };
};

const uploadSingle = async (localId) => {
  return new Promise((resolve, reject) => {
    wx.uploadVoice({
      localId: localId, // 需要上传的音频的本地ID，由stopRecord接口获得
      isShowProgressTips: 0, // 默认为1，显示进度提示
      success: async (res) => {
        resolve(res.serverId);
      },
      fail: (err) => {
        console.remote('redux/boss 43', err);
        reject(err);
      },
    });
  });
};

export const submitRecordAsync = (payload) => {
  return async (dispatch) => {
    if (!payload.localIds) {
      return dispatch(displayErrors({server: '录音不存在'}));
    }
    // if (!payload.nickname) {
    //   return dispatch(displayErrors({nickname: '需要输入昵称后才可以提交'}));
    // }
    // dispatch(uploadingRecord(true));

    const localIds = payload.localIds.slice();

    const serverIds = [];
    while (localIds.length > 0) {
      const localId = localIds.pop();
      try {
        const serverId = await uploadSingle(localId);
        serverIds.splice(0, 0, serverId);
      } catch (err) {
        dispatch(displayErrors({server: '上传失败，请重试'}));
        throw err;
      }
    }
    payload.serverIds = serverIds;

    try {
      const response = await ajax.post('/api/boss_answers/', payload);
      // go to homework view
      // history.pushState(null, `/home/homeworks/${response._id}`);
    } catch (err) {
        console.remote('redux/boss', err);
      // dispatch(displayErrors({server: '提交失败，请重试'}));
    }
  };
};

export const actions = {
  receivedBosses,
  fetchBossesAsync,
  submitRecordAsync,
  toggleCollectionModal,
  toggleReviewModal,
  toggleMethodModal,
  toggleFeedbackModal,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [RECEIVED_BOSSES]: (state, {payload}) => {
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
  [DISPLAY_ERRORS]: (state, {payload}) => {
    state.errors = payload;
    return Object.assign({}, state);
  },
}, {docs: []});
