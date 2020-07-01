const router = require('koa-router')();
const AuthController = require('../controllers/auth');

router.get('/', async ctx => {
  await ctx.redirect('/html/login.html');
});

router.post('/login', AuthController.login);

module.exports = router;
