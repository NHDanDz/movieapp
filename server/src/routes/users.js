// server/src/routes/users.js
const express = require('express');
const upload = require('../utils/multer');
const User = require('../models/user');
const auth = require('../middlewares/auth');
const { sql, poolPromise } = require('../db/mssql');

const router = new express.Router();

// Đăng ký người dùng mới
router.post('/users', async (req, res) => {
  try {
    const { role } = req.body;
    if (role) throw new Error('you cannot set role property.');
    
    // Kiểm tra thông tin người dùng
    const errors = User.validateUser(req.body);
    if (errors) {
      return res.status(400).send({ errors });
    }
    
    const user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    
    res.status(201).send({ user, token });
  } catch (e) {
    if (e.message.includes('Username') && e.message.includes('duplicate')) {
      return res.status(400).send({ error: 'Username đã tồn tại' });
    }
    if (e.message.includes('Email') && e.message.includes('duplicate')) {
      return res.status(400).send({ error: 'Email đã tồn tại' });
    }
    if (e.message.includes('Phone') && e.message.includes('duplicate')) {
      return res.status(400).send({ error: 'Số điện thoại đã tồn tại' });
    }
    
    res.status(400).send({ error: e.message });
  }
});

// Upload ảnh đại diện
router.post('/users/photo/:id', upload('users').single('file'), async (req, res, next) => {
  const url = `${req.protocol}://${req.get('host')}`;
  const { file } = req;
  const userId = req.params.id;
  
  try {
    if (!file) {
      const error = new Error('Vui lòng tải lên một tệp tin');
      error.httpStatusCode = 400;
      return next(error);
    }
    
    const user = await User.findById(userId);
    if (!user) return res.sendStatus(404);
    
    user.imageurl = `${url}/${file.path}`;
    await user.save();
    
    res.send({ user, file });
  } catch (e) {
    console.log(e);
    res.sendStatus(400).send(e);
  }
});

// Đăng nhập người dùng
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.username, req.body.password);
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({
      error: { message: 'Tên đăng nhập hoặc mật khẩu không đúng' },
    });
  }
});

// Đăng nhập qua Facebook
router.post('/users/login/facebook', async (req, res) => {
  const { email, userID, name } = req.body;
  const nameArray = name.split(' ');
  
  try {
    let user = await User.findOne({ facebook: userID });
    
    if (!user) {
      const newUser = new User({
        name,
        username: nameArray.join('').toLowerCase() + userID,
        email,
        facebook: userID,
      });
      
      await newUser.save();
      const token = await newUser.generateAuthToken();
      res.status(201).send({ user: newUser, token });
    } else {
      const token = await user.generateAuthToken();
      res.send({ user, token });
    }
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Đăng nhập qua Google
router.post('/users/login/google', async (req, res) => {
  const { email, googleId, name } = req.body;
  const nameArray = name.split(' ');
  
  try {
    let user = await User.findOne({ google: googleId });
    
    if (!user) {
      const newUser = new User({
        name,
        username: nameArray.join('').toLowerCase() + googleId,
        email,
        google: googleId,
      });
      
      await newUser.save();
      const token = await newUser.generateAuthToken();
      res.status(201).send({ user: newUser, token });
    } else {
      const token = await user.generateAuthToken();
      res.send({ user, token });
    }
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Đăng xuất
router.post('/users/logout', auth.simple, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('userId', sql.Int, req.user.id)
      .input('token', sql.NVarChar, req.token)
      .query('DELETE FROM UserTokens WHERE UserID = @userId AND Token = @token');
    
    res.send({});
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Đăng xuất tất cả thiết bị
router.post('/users/logoutAll', auth.enhance, async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query('DELETE FROM UserTokens WHERE UserID = @userId');
    
    res.send({});
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Lấy tất cả người dùng (chỉ admin)
router.get('/users', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).send({
      error: 'Bạn không có quyền thực hiện hành động này!',
    });
  }
  
  try {
    const users = await User.find({});
    res.send(users);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Lấy thông tin người dùng hiện tại
router.get('/users/me', auth.simple, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Lấy thông tin người dùng theo ID (chỉ admin)
router.get('/users/:id', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).send({
      error: 'Bạn không có quyền thực hiện hành động này!',
    });
  }
  
  const _id = req.params.id;
  
  try {
    const user = await User.findById(_id);
    if (!user) return res.sendStatus(404);
    res.send(user);
  } catch (e) {
    res.sendStatus(400);
  }
});

// Cập nhật thông tin người dùng
router.patch('/users/me', auth.simple, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'username', 'email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Thông tin cập nhật không hợp lệ!' });
  }
  
  try {
    const { user } = req;
    updates.forEach((update) => (user[update] = req.body[update]));
    
    // Kiểm tra thông tin người dùng
    const errors = User.validateUser(user);
    if (errors) {
      return res.status(400).send({ errors });
    }
    
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Admin cập nhật thông tin người dùng theo ID
router.patch('/users/:id', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).send({
      error: 'Bạn không có quyền thực hiện hành động này!',
    });
  }
  
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'phone', 'username', 'email', 'password', 'role'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  
  if (!isValidOperation) {
    return res.status(400).send({ error: 'Thông tin cập nhật không hợp lệ!' });
  }
  
  try {
    const user = await User.findById(_id);
    if (!user) return res.sendStatus(404);
    
    updates.forEach((update) => (user[update] = req.body[update]));
    
    // Kiểm tra thông tin người dùng
    const errors = User.validateUser(user);
    if (errors) {
      return res.status(400).send({ errors });
    }
    
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

// Admin xóa người dùng theo ID
router.delete('/users/:id', auth.enhance, async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).send({
      error: 'Bạn không có quyền thực hiện hành động này!',
    });
  }
  
  const _id = req.params.id;
  
  try {
    const user = await User.findById(_id);
    if (!user) return res.sendStatus(404);
    
    await user.remove();
    res.send({ message: 'Đã xóa người dùng thành công' });
  } catch (e) {
    res.sendStatus(400);
  }
});

// Người dùng tự xóa tài khoản
router.delete('/users/me', auth.simple, async (req, res) => {
  if (req.user.role === 'superadmin') {
    return res.status(403).send({
      error: 'Bạn không thể tự xóa tài khoản superadmin!',
    });
  }
  
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.sendStatus(400);
  }
});

module.exports = router;