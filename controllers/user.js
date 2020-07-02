'use strict';

const fs = require('fs');
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const userServices = require('../services/user');
const User = require('../models/user');

class UserController {
  // 注册用户
  static async create(ctx) {
    // 参数校验
    const user = ctx.validate({
      username: ctx.Joi.string().trim().min(3)
        .max(18),
      password: ctx.Joi.string().trim().min(6)
        .max(18),
      rePassword: ctx.Joi.string().min(6).max(18)
    }, Object.assign(ctx.request.body, ctx.query, ctx.params));
    await ctx.service.user.addUser(user);
  }

  // 获取当前用户的个人信息
  static async getUserInformation(ctx) {
    const userInfo = ctx.session.userInfo;
    const user = await User.findOne({ _id: userInfo._id }).lean();
    user.userId = user._id;
    ctx.response.body = user;
  }

  // 更新当前用户的个人信息
  static async updateUserInformation(ctx) {
    // 参数校验
    const data = ctx.validate({
      nickname: ctx.Joi.string().min(3).max(18),
      email: ctx.Joi.string().email(),
      avatar: ctx.Joi.string(),
      sex: [1, 0],
      intro: ctx.Joi.string().max(256),
      age: ctx.Joi.number().min(0).max(120),
      password: ctx.Joi.string().min(6).max(24),
      oldPassword: ctx.Joi.string().min(6).max(24)
    }, Object.assign(ctx.request.body, ctx.query, ctx.params).all);
    ctx.response.body = await userServices.updateUserInformation(ctx, data);
  }

  /**
     * 上传头像方法
     * @return {Promise<void>}
     */
  static async uploadAvatar(ctx) {
    // 获取上传的文件
    const file = ctx.request.files.file;
    const stream = fs.createReadStream(file.path);
    // stream对象也包含了文件名，大小等基本信息
    const filename = '/static/uploadAvatar/' + new Date().getTime() +
            '-' + Math.floor(Math.random() * 100000) + '-' + file.name;
    // 创建文件写入路径
    const target = path.join('./public', filename);
    try {
      // 创建文件写入流
      const fileStream = fs.createWriteStream(target);
      // 以管道方式写入流
      await stream.pipe(fileStream);
    } catch (e) {
      // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
      await sendToWormhole(stream);
      ctx.code = 1;
      ctx.body = { msg: '上传头像失败' };
      return;
    }
    ctx.body = { url: filename };
  }

  // 修改用户密码
  static async updateUserPassword(ctx) {
    // 参数校验
    const data = ctx.validate({
      id: ctx.helper.validateObj('_id').required(),
      password: ctx.Joi.string().min(6).max(18),
      newPassword: ctx.Joi.string().min(6).max(18)
    }, Object.assign(ctx.request.body, ctx.query, ctx.params));
    ctx.body = await ctx.service.user.updateUserPassword(data);
  }
}

module.exports = UserController;
