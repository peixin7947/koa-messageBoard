const router = require('koa-router')();
const AuthController = require('../controllers/auth');
const HomeController = require('../controllers/home');

router.get('/', async ctx => {
  await ctx.redirect('/html/login.html');
});

router.post('/login', AuthController.login);

router.get('/', HomeController.index); // 首页跳转
router.get('/api/time', HomeController.time); // 首页跳转
router.post('/register', AuthController.register); // 注册用户
router.post('/user', controller.user.create); // 添加一个用户

module.exports = router;
