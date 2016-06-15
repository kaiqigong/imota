import ajax from './ajax';

const tick = function() {
  // 点击 滚动 记录事件
  const listener = (e) => {
    ajax.post('/api/stats/beats/', {
      url: window.location.href.replace(window.location.origin, ''),
    });
    window.removeEventListener('click', listener);
    setTimeout(() => window.addEventListener('click', listener), 1000 * 30);
  };
  window.addEventListener('click', listener);
}

export default {
  start: () => tick(),
};
