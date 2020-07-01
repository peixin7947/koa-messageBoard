'use strict';

const config = {};
config.keys = '1132a4f65as1fa6fa54sg65a';

config.login = {
  LOGIN_FIELD: 'userInfo',
  ignore(ctx) {
    if (['/register', '/login'].includes(ctx.request.path)) return true;
    if (ctx.request.path.startsWith('/static/')) return true;
  }
};

config.session = {
  key: 'EGG_SESS',
  maxAge: 24 * 3600 * 1000, // 1 天
  httpOnly: true,
  encrypt: true,
  renew: true
};
module.exports = config;
