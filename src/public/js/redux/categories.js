import {createAction, handleActions} from 'redux-actions';
import ajax from '../common/ajax';
import unionBy from 'lodash/unionBy';
import findIndex from 'lodash/findIndex';

// ------------------------------------
// Constants
// ------------------------------------
export const RECEIVED_CATEGORIES = 'RECEIVED_CATEGORIES';
export const RECEIVED_MORE_CATEGORIES = 'RECEIVED_MORE_CATEGORIES';
export const REMOVED_CATEGORY = 'REMOVED_CATEGORY';
export const RENAME_CATEGORY = 'RENAME_CATEGORY';
export const UPDATED_CATEGORY = 'UPDATED_CATEGORY';

// ------------------------------------
// Actions
// ------------------------------------
export const receivedCategories = createAction(RECEIVED_CATEGORIES, (payload) => payload);
export const receivedMoreCategories = createAction(RECEIVED_MORE_CATEGORIES, (payload) => payload);
export const removedCategory = createAction(REMOVED_CATEGORY, (payload) => payload);
export const renameCategory = createAction(RENAME_CATEGORY, (payload) => payload);
export const updatedCategory = createAction(UPDATED_CATEGORY, payload => payload);
export const fetchCategoriesAsync = () => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/post_categories/', {page: 1});
      dispatch(receivedCategories(response));
    } catch (err) {
      console.remote('redux/categories 22', err);
    }
  };
};

export const fetchMoreCategoriesAsync = (page) => {
  return async (dispatch) => {
    try {
      const response = await ajax.get('/api/post_categories/', {page});
      dispatch(receivedMoreCategories(response));
    } catch (err) {
      console.remote('redux/categories 33', err);
    }
  };
};

export const updateCategoryAsync = (category) => {
  return async (dispatch) => {
    try {
      const response = await ajax.put('/api/post_categories/' + category._id, category);
      dispatch(updatedCategory(response));
    } catch (err) {
      console.remote('redux/categories 47', err);
    }
  }
}

export const createCategoryAsync = () => {
  return async (dispatch) => {
    try {
      const response = await ajax.post('/api/post_categories/');
      dispatch(receivedMoreCategories(response));
    } catch (err) {
      console.remote('redux/categories 44', err);
    }
  };
};

export const removeCategoryAsync = (category) => {
  return async (dispatch) => {
    try {
      const response = await ajax.del('/api/post_categories/' + category._id);
      dispatch(removedCategory(category._id));
    } catch (err) {
      console.remote('redux/categories 44', err);
    }
  };
};

export const actions = {
  receivedCategories,
  receivedMoreCategories,
  fetchCategoriesAsync,
  fetchMoreCategoriesAsync,
  createCategoryAsync,
  removeCategoryAsync,
  renameCategory,
  updateCategoryAsync,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions({
  [RECEIVED_CATEGORIES]: (state, {payload}) => {
    return {...payload};
  },
  [RECEIVED_MORE_CATEGORIES]: (state, {payload}) => ({
    ...state,
    ...payload,
    docs: unionBy(state.docs, payload.docs, '_id'),
  }),
  [REMOVED_CATEGORY]: (state, {payload}) => ({
    ...state,
    total: state.total - 1,
    docs: state.docs.filter((item) => item._id !== payload),
  }),
  [RENAME_CATEGORY]: (state, {payload}) => ({
    ...state,
    editing: payload,
  }),
  [UPDATED_CATEGORY]: (state, {payload}) => {
    state.docs.splice(findIndex(state.docs, {_id: payload._id}), 1, payload);
    return {...state};
  },
}, {docs: []});
