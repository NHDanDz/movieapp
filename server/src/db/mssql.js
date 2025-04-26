// server/src/db/mssql.js
const sql = require('mssql');

// Cấu hình kết nối SQL Server
const config = {
  user: process.env.DB_USER || 'nhdandz',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'LAPTOP-QVMCBH5N',  // Thử thay bằng 'localhost' hoặc '127.0.0.1'
  database: process.env.DB_NAME || 'movieapp',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true 
  },
  port: 1433,  // Xác định rõ port
  connectionTimeout: 30000,
  requestTimeout: 30000
};

// Tạo pool kết nối
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server successfully');
    return pool;
  })
  .catch(err => {
    console.log('Database Connection Failed: ', err);
    console.log('Connection config:', {
      server: config.server,
      database: config.database,
      user: config.user, 
      port: config.port
    });
  });

// Export pool và sql để sử dụng trong ứng dụng
module.exports = {
  sql,
  poolPromise
};