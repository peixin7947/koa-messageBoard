'use strict';
const Message = require('../models/message');

class MessageService {
  /**
     * 获取用户的留言
     * @param {Object} ctx 上下文对象
     * @param {Object} data 参数体
     * @return {Promise<{list}>} 分页查询数据和总量
     */
  static async listMessage(ctx, data) {
    let { sort, pageSize, pageIndex } = data;
    sort = JSON.parse(sort);
    const items = await Message.find({ isDel: false, doDel: null })
      .populate([
        { path: 'creator', select: 'nickname avatar' },
        { path: 'reply.creator', select: 'nickname avatar' },
        { path: 'reply.toUser', select: 'nickname avatar' }
      ])
      .sort(sort)
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize)
      .lean();
    // 除去已删除的评论
    items.forEach(item => {
      if (item.reply && item.reply.length) {
        ctx._.remove(item.reply, reply => reply.isDel !== false);
      }
      item.children = item.reply;
    });

    const total = await Message.count({ isDel: false, doDel: null });
    return { items, total };
  }

  /**
     * 增加评论
     * @param {Object} ctx 上下文对象
     * @param {Object} data 参数体
     * @return {Promise<{msg: string}>} 返回消息
     */
  static async createReply(ctx, data) {
    const { toUser, content, messageId } = data;
    const userInfo = ctx.session.userInfo;
    const message = await Message.findOne({
      $or: [{ _id: messageId }, { 'reply._id': messageId }],
      isDel: false,
      doDel: null
    });
    if (!message) {
      ctx.code = 1;
      return { msg: '留言评论不存在' };
    }
    message.reply.push({ creator: userInfo._id, content, toUser });
    message.save();
    return { msg: '发布留言成功' };
  }

  /**
     * 删除留言或评论
     * @param ctx 上下文对象
     * @param data 参数体
     * @returns {Promise<{msg: string}>}
     */
  static async deleteMessage(ctx, data) {
    const { id } = data;
    const userInfo = ctx.session.userInfo;
    const message = await Message.findOne({ $or: [{ _id: id }, { 'reply._id': id }], isDel: false, doDel: null });
    if (!message) return { msg: '留言不存在或已被删除' };
    // 如果是留言
    if (String(message._id) === String(id)) {
      if (String(message.creator) !== String(userInfo._id)) {
        ctx.code = 1;
        return { msg: '无权删除' };
      }
      message.isDel = true;
      message.doDel = { userId: userInfo._id };
    } else {
      const reply = message.reply.find(item => String(item._id) === String(id));
      if (String(reply.creator) !== String(userInfo._id) && String(message.creator) !== String(userInfo._id)) {
        ctx.code = 1;
        return { msg: '无权删除' };
      }
      reply.isDel = true;
      reply.doDel = { userId: userInfo._id };
    }
    message.save();
    return { msg: '删除成功' };
  }

  /**
     * 编辑留言评论
     * @param ctx 上下文对象
     * @param {Object} data 参数体
     * @param {String} data.id 留言评论id
     * @param {String} data.content 留言评论的内容
     * @param {String} data.title 留言的主题
     * @return {Promise<{msg: string}>} 返回消息
     */
  static async updateMessage(ctx, data) {
    const { id, content, title } = data;
    const userInfo = ctx.session.userInfo;
    const message = await Message.findOne({ $or: [{ _id: id }, { 'reply._id': id }], isDel: false, doDel: null });
    // 如果留言或消息不存在
    if (!message) {
      ctx.code = 1;
      return { msg: '留言或评论不存在' };
    }
    if (String(message._id) === id) {
      if (String(message.creator) !== String(userInfo._id)) {
        ctx.code = 1;
        return { msg: '不可编辑非自己的留言' };
      }
      message.content = content;
      message.title = title;
      message.updateTime = new Date();
    } else {
      const reply = message.reply.find(item => String(item.creator._id) === String(userInfo._id));
      if (String(reply.creator) !== String(userInfo._id)) {
        ctx.code = 1;
        return { msg: '不可编辑非自己的留言' };
      }
      reply.content = content;
    }
    message.save();
    return { msg: '修改成功' };
  }

  /**
     * 获取用户的留言列表
     * @param {Object} ctx 上下文对象
     * @param {Object} data 参数体
     * @return {Promise<{total, items}>} 留言的数据和总量
     */
  static async getMessageListByUserId(ctx, data) {
    let { id, sort, pageSize, pageIndex } = data;
    sort = JSON.parse(sort);
    const items = await Message.find({ creator: ctx.mongoose.Types.ObjectId(id, {}), isDel: false, doDel: null })
      .populate([
        { path: 'creator', select: 'nickname avatar' },
        { path: 'reply.creator', select: 'nickname avatar' },
        { path: 'reply.toUser', select: 'nickname avatar' }
      ])
      .sort(sort)
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize)
      .lean();
    // 除去已删除的评论
    items.forEach(item => {
      if (item.reply && item.reply.length) {
        ctx._.remove(item.reply, reply => reply.isDel !== false);
      }
      item.children = item.reply;
    });

    const total = await Message.count({ creator: id, isDel: false, doDel: null });
    return { items, total };
  }

  /**
     *  获取用户的评论
     * @param {Object} ctx 上下文对象
     * @param {Object} data 参数体
     * @return {Promise<{total: number, items: []}>} 回复的数据和总量
     */
  static async getReplyListByUserId(ctx, data) {
    let { id, sort, pageSize, pageIndex } = data;
    sort = JSON.parse(sort);
    const message = await Message.find({
      'reply.creator': ctx.mongoose.Types.ObjectId(id),
      isDel: false,
      doDel: null
    })
      .populate([
        { path: 'creator', select: 'nickname avatar' },
        { path: 'reply.creator', select: 'nickname avatar' },
        { path: 'reply.toUser', select: 'nickname avatar' }
      ])
      .sort(sort)
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize)
      .lean();
    let items = [];
    message.forEach(item => {
      items = ctx._.union(items, item.reply.filter(reply => String(reply.creator._id) === id));
    });

    return { items, total: items.length };
  }
}

module.exports = MessageService;
