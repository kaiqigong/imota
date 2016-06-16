import $ from 'zeptojs';
import babelPolyfill from 'babel-polyfill'; // eslint-disable-line no-unused-vars
import {validateEmail, validatePhone, validatePassword, validateRequired} from './common/validations';
import sha1 from 'sha1';

$.ajaxSettings = {
  accepts: 'application/json',
};

// consts

// $ elements
const mobileInput = $('#mobile-input');
const passwordInput = $('#password-input');
const loginForm = $('#login-form');
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

_hmt.push(['_trackEvent', 'pageView', 'login']);

loginForm.on('submit', (e) => {
  _hmt.push(['_trackEvent', 'login', 'submit']);
  // validate
  let valid = false;
  valid = validateForm();
  if (valid) {
    passwordInput.val(sha1(passwordInput.val().trim()));
    loading.show();
  } else {
    e.preventDefault();
    return;
  }
});

// 控制页面效果
const validateForm = () => {
  let valid = true;
  if (!mobileInput.val()) {
    displayError(mobileInput, '<i class="icon-cuowutishi"></i> 请输入手机号');
    valid = false;
  } else if (!validatePhone(mobileInput.val())) {
    displayError(mobileInput, '<i class="icon-cuowutishi"></i> 手机号格式错误');
    valid = false;
  } else {
    hideError(mobileInput);
  }
  if (!passwordInput.val()) {
    displayError(passwordInput, '<i class="icon-cuowutishi"></i> 请输入密码');
    valid = false;
  } else if (!validatePassword(passwordInput.val())) {
    displayError(passwordInput, '<i class="icon-cuowutishi"></i> 密码格式不符合要求');
    valid = false;
  } else {
    hideError(passwordInput);
  }
  return valid;
};
