const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = folderName =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      // Lấy id từ param
      const id = req.params.id;
      // Tạo đường dẫn đến thư mục lưu file
      const dir = path.join(__dirname, '../../public', folderName, id);
      
      // Kiểm tra và tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      console.log('Upload destination:', dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueFilename = `${Date.now()}${path.extname(file.originalname)}`;
      console.log('Generated filename:', uniqueFilename);
      cb(null, uniqueFilename);
    },
  });

const upload = folderName =>
  multer({
    storage: storage(folderName),
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // Giới hạn kích thước file 5MB
    }
  });

module.exports = upload;