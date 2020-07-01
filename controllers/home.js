'use strict';

class HomeController {
  // 得到服务器时间，初始化csrf用
  static async time(ctx) {
    ctx.body = Date();
  }

  // 首页跳转
  static async index(ctx) {
    const userInfo = ctx.session.userInfo;
    // 已经登录
    if (userInfo) {
      return ctx.redirect('/html/messageBoard.html');
    }
    return ctx.redirect('/html/login.html');
  }
}

module.exports = HomeController;
