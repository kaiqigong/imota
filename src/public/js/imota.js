import babelPolyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import React from 'react';
import history from './common/history';
import ReactDom from 'react-dom';
import Root from './containers/Root';
import routes from './routes/imota';
import imotaReducer from './redux/imota';
import './common/airlog';
import {
  applyMiddleware,
  compose,
  createStore,
} from 'redux';
import thunk from 'redux-thunk';

window.imota = true;

let createStoreWithMiddleware;
const middleware = applyMiddleware(thunk);
createStoreWithMiddleware = compose(middleware);
const store = createStoreWithMiddleware(createStore)(
  imotaReducer, {}
);

window.dispatch = store.dispatch;

window.addEventListener('load', () => {
  ReactDom.render(<Root history={history} routes={routes} store={store} />, document.getElementById('app'));
});
