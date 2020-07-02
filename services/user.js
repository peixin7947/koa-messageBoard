'use strict';
const md5 = require('js-md5');
const User = require('../models/user');

class UserService {
  /**
     * 增加一个用户
     * @param {Object} user 用户
     * @return {Promise<void>} 无需返回
     */
  static async addUser(user) {
    await User({
      username: user.username,
      password: md5(user.password),
      nickname: user.username
    }).save();
  }

  /**
     * 修改用户信息
     * @param {Object} ctx 上下文对象
     * @param {Object} data 参数体
     * @return {Promise<{msg: string}>} 返回消息
     */
  static async updateUserInformation(ctx, data) {
    const userInfo = ctx.session.userInfo;
    // 如果是修改密码
    const { oldPassword, password } = data;
    if (password) {
      const user = await User.findOne({ _id: userInfo._id, password: md5(oldPassword) }).lean();
      if (!user) {
        ctx.code = 2;
        return { msg: '原密码输入错误' };
      }
      data.password = md5(password);
    }
    await User.updateOne({ _id: userInfo._id }, data);
    return { msg: '修改成功' };
  }

  /**
     * 修改用户密码
     * @param {Object} data 参数体
     * @return {Promise<{msg: string}>} 返回消息
     */
  static async updateUserPassword(data) {
    const { id, password, newPassword } = data;
    await User.findOneAndUpdate({ _id: id, password: md5(password) }, { password: newPassword });
    return { msg: '修改密码成功' };
  }

  /**
     * 重置用户密码
     * @param {Object} ctx 上下文对象
     * @param {Object} data 参数体
     * @param {String} data.username 用户名
     * @param {String} data.email 用户邮箱
     * @param {String} data.password 用户密码
     * @return {Promise<{msg: string}>} 返回类型
     */
  static async resetPassword(ctx, data) {
    const { username, password, email } = data;
    const user = await User.findOne({ username });
    if (!user) {
      ctx.code = 1;
      return { msg: '用户不存在' };
    }
    if (user.email !== email) {
      ctx.code = 1;
      return { msg: '输入邮箱不正确' };
    }
    user.password = md5(password);
    user.save();
    return { msg: '修改密码成功' };
  }
}

module.exports = UserService;
