import $ from 'zeptojs';
import babelPolyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import qs from 'qs';
import {validateEmail, validatePhone, validatePassword, validateRequired} from './common/validations';

$.ajaxSettings = {
  accepts: 'application/json',
};

// consts

// $ elements
const profileForm = $('#profile-form');
const loading = $('.loading');

const displayError = (element, message) => {
  const selector = element.selector;
  const errorSpan = $(selector + '-error');
  errorSpan.html(message);
  errorSpan.show();
};

const hideError = (element) => {
  const selector = element.selector;
  const errorSpan = $(selector + '-error');
  errorSpan.hide();
};

profileForm.on('submit', (e) => {
  const formDataStr = profileForm.serialize();
  const formData = qs.parse(formDataStr);

  // validate
  let valid = false;
  valid = validateForm(formData);
  if (valid) {
    loading.show();
  } else {
    e.preventDefault();
    return;
  }
});

// 控制页面效果
const validateForm = (data) => {
  let valid = true;
  return valid;
};
