'use strict';
const messageService = require('../services/message');
const Message = require('../models/message');

class MessageController {
  /**
   * 获取当前的留言
   * @param ctx
   * @returns {Promise<void>}
   */
  static async listMessage(ctx) {
    const data = ctx.validate({
      sort: ctx.Joi.string().default('{"createTime":-1}'),
      pageSize: ctx.Joi.number().default(10),
      pageIndex: ctx.Joi.number().default(1)
    }, Object.assign(ctx.params, ctx.request.body, ctx.query));
    ctx.body = await messageService.listMessage(ctx, data);
  }

  /**
     * 发布留言
     * @return {Promise<void>}
     */
  static async createMessage(ctx) {
    const data = ctx.validate({
      content: ctx.Joi.string().max(1024)
        .required(),
      title: ctx.Joi.string().max(30)
        .required()
    }, Object.assign(ctx.params, ctx.request.body, ctx.query));
    const { title, content } = data;
    const userInfo = ctx.session.userInfo;
    await Message.create({ creator: userInfo._id, content, title });
    ctx.response.body = { msg: '发布留言成功' };
  }

  /**
     *  增加评论方法
     * @return {Promise<void>}
     */
  static async createReply(ctx) {
    const data = ctx.validate({
      messageId: ctx.helper.validateObj('_id').required(),
      toUser: ctx.helper.validateObj('_id').required(),
      content: ctx.Joi.string().trim().max(1024).required()
    }, Object.assign(ctx.params, ctx.request.body, ctx.query));
    ctx.response.body = await messageService.createReply(ctx, data);
  }

  // 删除留言或者评论
  static async deleteMessage(ctx) {
    const data = ctx.validate({
      id: ctx.helper.validateObj('_id')
    }, Object.assign(ctx.params, ctx.request.body, ctx.query));
    ctx.response.body = await messageService.deleteMessage(ctx, data);
  }

  // 编辑留言或者评论
  static async updateMessage(ctx) {
    const data = ctx.validate({
      id: ctx.helper.validateObj('_id').required(),
      content: ctx.Joi.string().max(1024).required(),
      title: ctx.Joi.string().max(30)
    }, Object.assign(ctx.params, ctx.request.body, ctx.query));
    ctx.response.body = await messageService.updateMessage(ctx, data);
  }

  /**
     * 获取用户的留言列表
     * @return {Promise<void>}
     */
  static async getMessageListByUserId(ctx) {
    const data = ctx.validate({
      id: ctx.helper.validateObj('_id').required(),
      sort: ctx.Joi.string().default('{"createTime":-1}'),
      pageSize: ctx.Joi.number().default(6),
      pageIndex: ctx.Joi.number().default(1)
    }, Object.assign(ctx.params, ctx.request.body, ctx.query));
    ctx.body = await messageService.getMessageListByUserId(ctx, data);
  }

  static async getReplyListByUserId(ctx) {
    const data = ctx.validate({
      id: ctx.helper.validateObj('_id').required(),
      sort: ctx.Joi.string().default('{"createTime":-1}'),
      pageSize: ctx.Joi.number().default(10),
      pageIndex: ctx.Joi.number().default(1)
    }, Object.assign(ctx.params, ctx.request.body, ctx.query));
    ctx.body = await messageService.getReplyListByUserId(ctx, data);
  }
}

module.exports = MessageController;
