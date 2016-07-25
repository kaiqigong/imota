import babelPolyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import React from 'react';
import ReactDom from 'react-dom';
import './common/airlog';

window.imota = true;

window.addEventListener('load', () => {
  ReactDom.render(<div>hello</div>, document.getElementById('app'));
});


