'use strict';

const userServices = require('../services/user');
const config = require('../config/config.default');
const md5 = require('js-md5');
const User = require('../models/user');

class AuthController {
  // 登录验证
  static async login(ctx) {
    // 参数校验
    const { username, password } = ctx.validate({
      username: ctx.Joi.string().min(3).max(24)
        .required(),
      password: ctx.Joi.string().min(6).max(24)
        .required()
    }, Object.assign({}, ctx.params, ctx.query, ctx.request.body));
    const user = await User.findOne({ username });
    if (!user) {
      ctx.code = 1;
      ctx.body = { msg: '用户不存在' };
      return;
    }
    if (user.password === md5(password)) {
      ctx.session[config.login.LOGIN_FIELD] = user;
      ctx.body = { msg: '登录成功' };
      return;
    }
    ctx.code = 1;
    ctx.body = { msg: '输入密码错误' };
  }

  // 用户注册
  static async register(ctx) {
    // 参数校验
    const data = ctx.validate({
      username: ctx.Joi.string().min(3).max(24)
        .trim()
        .required(),
      password: ctx.Joi.string().min(6).max(24)
        .trim()
        .required(),
      rePassword: ctx.Joi.string().min(6).max(24)
        .trim()
        .required()
    }, Object.assign({}, ctx.params, ctx.query, ctx.request.body));

    const userObj = await User.findOne({ username: data.username });
    if (userObj) {
      ctx.code = 1;
      ctx.body = { msg: '用户名已存在' };
      return;
    }
    await userServices.addUser(data);
    ctx.response.body = { msg: '注册成功' };
  }

  // 用户退出登录
  static async logout(ctx) {
    ctx.session.userInfo = null;
    ctx.body = { msg: '已退出登录' };
  }

  // 重置密码
  static async resetPassword(ctx) {
    // 参数校验
    const data = ctx.validate({
      username: ctx.Joi.string().min(3).max(24)
        .trim()
        .required(),
      email: ctx.Joi.string().email().required(),
      password: ctx.Joi.string().min(6).max(24)
        .trim()
        .required()
    }, Object.assign({}, ctx.params, ctx.query, ctx.request.body));
    ctx.body = await userServices.resetPassword(ctx, data);
  }
}

module.exports = AuthController;
