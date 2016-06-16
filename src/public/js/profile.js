import $ from 'zeptojs';
import babelPolyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import qs from 'qs';
import {validateEmail, validatePhone, validatePassword, validateRequired} from './common/validations';
import sha1 from 'sha1';

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

_hmt.push(['_trackEvent', 'pageView', 'profile']);

profileForm.on('submit', (e) => {
  const formDataStr = profileForm.serialize();
  const formData = qs.parse(formDataStr);
  _hmt.push(['_trackEvent', 'profile', 'submit']);
  // validate
  let valid = false;
  valid = validateForm(formData);
  if (formData.password && formData.password.trim()) {
    console.log(formData.password);
    $('#password-input').val(sha1(formData.password.trim()));
  }
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
