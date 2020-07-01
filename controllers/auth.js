'use strict';

const authServices = require('../services/auth');
const User = require('../models/user');

class AuthController {
  // 登录验证
  static async login(ctx) {
    // 参数校验
    const data = ctx.validate({
      username: ctx.Joi.string().min(3).max(24)
        .required(),
      password: ctx.Joi.string().min(6).max(24)
        .required()
    }, Object.assign({}, ctx.params, ctx.query, ctx.request.body));
    ctx.body = await authServices.login(ctx, data);
  }

  // 用户注册
  static async register() {
    const { ctx } = this;
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
    await ctx.service.user.addUser(data);
    ctx.response.body = { msg: '注册成功' };
  }

  // 用户退出登录
  static async logout() {
    const { ctx } = this;
    ctx.session.userInfo = null;
    ctx.body = { msg: '已退出登录' };
  }

  // 重置密码
  static async resetPassword() {
    const { ctx } = this;
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
    ctx.body = await ctx.service.user.resetPassword(data);
  }
}

module.exports = AuthController;
