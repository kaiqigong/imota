import compose from 'composable-middleware';

/**
 * Set token cookie directly for oAuth strategies
 */
export const verifySession = () => {
  return compose()
  .use((req, res, next) => {
    if (req.session.loginAccount) {
      req.user = req.session.loginAccount;
      return next();
    }
    return next({message: '无法验证用户信息', status: 401});
  });
};

export const requireLogin = () => {
  return compose()
  .use((req, res, next) => {
    if (req.session.loginAccount) {
      req.user = req.session.loginAccount;
      return next();
    }
    return res.redirect('/account/login/?r=' + encodeURIComponent(req.headers.referer || '/'));
  });
};

/**
 * Checks if the user role meets the minimum requirements of the route
 */
export const hasRole = (roleRequired) => {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }
  return compose()
  .use(requireLogin())
  .use((req, res, next) => {
    if (req.user.roles && req.user.roles.indexOf(roleRequired) > -1) {
      return next();
    }
    return next({message: '权限不足', status: 403});
  });
};

export default {
  verifySession,
  hasRole,
  requireLogin,
};
