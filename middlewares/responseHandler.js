'use strict';

async function responseHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    const res = {
      status: err.code || 1, // 0为正常业务逻辑，1为业务错误, 2为服务端出错
      msg: err.msg || err.message || '该错误无错误说明',
      data: err.data
    };
    // 所有的异常都在 app 上触发一个 error 事件，框架会记录一条错误日志
    ctx.app.emit('error', err, ctx);

    const status = err.status || 500;

    // 生产环境时 500 错误的详细错误内容不返回给客户端，因为可能包含敏感信息
    const error = status === 500 && ctx.app.env === 'prod'
      ? 'Internal Server Error'
      : err.message;
    // 从 error 对象上读出各个属性，设置到响应中
    res.msg = error;

    // 参数校验错误
    if (status === 422) {
      console.log(err);
      switch (err.details[0].context.key) {
        case 'username':
          res.msg = '应提供有效的用户名!';
          break;
        case 'email':
          res.msg = '应提供有效的电子邮件！';
          break;
        case 'password':
          res.msg = '密码长度应该是6-24！';
          break;
        case 'rePassword':
          res.msg = '两次输入的密码应该相同!';
          break;
        default:
          res.msg = '信息无效!';
      }
    }

    ctx.response.body = res;
    return ctx.response.body;
  }

  if ([200, 204].includes(ctx.status)) {
    if (ctx.status === 204) ctx.status = 200;
    ctx.response.body = {
      status: ctx.code || 0,
      msg: ctx.response.body.msg || 'success',
      data: ctx.response.body
    };
  }
};
module.exports = responseHandler;
