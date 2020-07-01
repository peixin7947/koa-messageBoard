const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const path = require('path');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const mongoose = require('mongoose');
const session = require('koa-session');

const responseHandler = require('./middlewares/responseHandler');
const login = require('./middlewares/login');
const context = require('./middlewares/context');
const config = require('./config/config.default');
const index = require('./routes/index');
const users = require('./routes/users');

// error handler

onerror(app);

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(views(__dirname + '/views', {
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
