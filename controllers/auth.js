'use strict';

const userServices = require('../services/auth');

class AuthController {
  // 登录验证
  static async login(ctx) {
    // 参数校验
    const data = ctx.Joi.validate({
      username: ctx.Joi.string().min(3).max(24)
        .required(),
      password: ctx.Joi.string().min(6).max(24)
        .required()
    }, Object.assign({}, ctx.params, ctx.query, ctx.request.body));
    ctx.body = await userServices.login(ctx, data);
  }
}

module.exports = AuthController;
