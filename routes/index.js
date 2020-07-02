const router = require('koa-router')();
const authController = require('../controllers/auth');
const homeController = require('../controllers/home');
const userController = require('../controllers/user');
const messageController = require('../controllers/message');

router.get('/', homeController.index); // 首页跳转
router.get('/api/time', homeController.time); // 首页跳转
router.post('/register', authController.register); // 注册用户
router.post('/user', userController.create); // 添加一个用户
router.post('/login', authController.login); // 登录用户
router.put('/api/resetPassword', authController.resetPassword); // 重置密码
router.get('/api/information', userController.getUserInformation); // 获取用户信息
router.put('/api/information', userController.updateUserInformation); // 更新用户信息
router.post('/api/avatar/upload', userController.uploadAvatar); // 上传用户头像
router.get('/api/:id/password', userController.updateUserPassword); // 修改用户密码
router.post('/api/logout', authController.logout); // 用户退出登录
router.get('/api/message', messageController.listMessage); // 获取留言
router.get('/api/message/:id', messageController.getMessageListByUserId); // 获取某个用户的留言
router.get('/api/reply/:id', messageController.getReplyListByUserId); // 获取某个用户的评论
router.post('/api/message', messageController.createMessage); // 创建留言
router.post('/api/reply', messageController.createReply); // 创建评论
router.delete('/api/message', messageController.deleteMessage); // 删除消息
router.put('/api/message', messageController.updateMessage); // 编辑消息

module.exports = router;
