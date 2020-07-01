'use strict';
const User = require('../models/user');
const md5 = require('js-md5');
const config = require('../config/config.default');

class AuthService {
  static async login(ctx, data) {
    const { username, password } = data;
    const user = await User.findOne({ username }).lean();
    if (!user) {
      ctx.code = 1;
      return { msg: '用户不存在' };
    }
    if (user.password === md5(password)) {
      ctx.session[config.login.LOGIN_FIELD] = user;
      // 调用 rotateCsrfSecret 刷新用户的 CSRF token
      // ctx.rotateCsrfSecret();
      return { msg: '登录成功' };
    }
    ctx.code = 1;
    return { msg: '输入密码错误' };
  }
}

module.exports = AuthService;
