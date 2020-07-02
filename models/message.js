'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
   * 删除者信息
   * @param {ObjectId} userId 删除留言的用户
   * @param {Date} delTime 删除留言的时间
   * @type {Schema}
   */
const delSchema = Schema({
  _id: false,
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  delTime: {
    type: Date,
    default: Date.now
  }
});

/**
 * description 二级回复
 * @param {ObjectId} toUser 接受回复的用户
 * @param {ObjectId} creator 发布回复的用户
 * @param {Boolean} idDel 回复是否被删除（逻辑删除）
 * @param {Date} createTime 回复时间
 * @param {Date} updateTime 回复更新（编辑）时间
 * @param {String} content 回复内容
 * @param {Object} doDel 删除者
 */
const replySchema = Schema({
  creator: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  toUser: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  content: {
    type: String,
    default: ''
  },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: null },
  isDel: {
    type: Boolean,
    default: false
  },
  doDel: {
    type: delSchema,
    default: null
  }
});

/**
   * description 留言集合
   * @param {ObjectId} creator 发布留言的用户
   * @param {Boolean} idDel 留言是否被删除（逻辑删除）
   * @param {Date} createTime 留言时间
   * @param {Date} updateTime 留言更新（编辑）时间
   * @param {String} content 留言内容
   * @param {Array} reply 二级回复内容
   * @param {Object} doDel 删除者
   */
const MessageSchema = Schema({
  creator: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
  },
  isDel: {
    type: Boolean,
    default: false
  },
  doDel: {
    type: delSchema,
    default: null
  },
  createTime: { type: Date, default: Date.now },
  updateTime: { type: Date, default: null },
  content: {
    type: String,
    default: ''
  },
  reply: {
    type: [replySchema],
    default: []
  },
  title: {
    type: String,
    default: ''
  }
}, {
  collection: 'Message'
});
const Message = mongoose.model('Message', MessageSchema, 'Message');

module.exports = Message;
