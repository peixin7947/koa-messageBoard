const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const logger = require('koa-logger');
const path = require('path');
const mongoose = require('mongoose');
const session = require('koa-session');
const koaBody = require('koa-body');
const responseHandler = require('./middlewares/responseHandler');
const login = require('./middlewares/login');
const context = require('./middlewares/context');
const config = require('./config/config.default');
const index = require('./routes/index');

// error handler
onerror(app);

// middlewares
// 上传文件
app.use(koaBody({
  multipart: true, // 支持文件上传
  formidable: {
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 5 * 1024 * 1024 // 文件上传大小
  }
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(path.join(__dirname, '/public')));

app.use(views(path.join(__dirname, '/views'), {
  extension: 'pug'
}));

// 封装Joi
app.use(context);
app.use(responseHandler);
app.use(login);
app.keys = ['124erf23rf3rf123wa123gt3w3r'];
app.use(session(config.session, app));

// routes
app.use(index.routes()).use(index.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

// mongoose
mongoose.connect('mongodb://127.0.0.1/messageboard');

module.exports = app;
