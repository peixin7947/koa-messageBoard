const router = require('koa-router')();
const authController = require('../controllers/auth');
const homeController = require('../controllers/home');
const userController = require('../controllers/user');

router.get('/', async ctx => {
  await ctx.redirect('/html/login.html');
});

router.post('/login', authController.login);

router.get('/', homeController.index); // 首页跳转
router.get('/api/time', homeController.time); // 首页跳转
router.post('/register', authController.register); // 注册用户
router.post('/user', userController.create); // 添加一个用户

module.exports = router;
