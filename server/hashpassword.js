const bcrypt = require('bcryptjs');

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 8);
  console.log('Password:', password);
  console.log('Hashed Password:', hashedPassword);
}

// Thay đổi mật khẩu ở đây
hashPassword('123456');