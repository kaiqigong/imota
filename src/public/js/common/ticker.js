import ajax from './ajax';

const tick = function() {
  return setTimeout(() => {
    ajax.post('/api/stats/beats/', {
      url: window.location.href.replace(window.location.origin, ''),
    });
    tick();
  }, 1000 * 30);
}

export default {
  start: () => tick(),
};
