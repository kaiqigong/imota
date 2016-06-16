/**
 * Created by noodles on 15/10/28.
 * description
 */

import random from 'lodash/random';
import times from 'lodash/times';

/**
 * Custom the function to generate captcha text
 * @param num 随机数位数
 * @returns {*} string '123456'
 */
export const randomSeed = (num) => {
  return Array.apply(0, Array(num)).map(() => {
    return ((charset) => {
      return charset.charAt(Math.floor(Math.random() * charset.length));
    }('0123456789'));
  }).join('');
};

export const generateRandomId = (count) => {
  return times(count, () => {
    return random(0, 9);
  }).join('');
};
