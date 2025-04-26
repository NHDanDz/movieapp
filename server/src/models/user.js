// server/src/models/user.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const { sql, poolPromise } = require('../db/mssql');

class User {
  constructor(data) {
    this.id = data.ID;
    this.name = data.Name;
    this.username = data.Username;
    this.email = data.Email;
    this.password = data.Password;
    this.role = data.Role;
    this.phone = data.Phone;
    this.imageurl = data.ImageUrl;
    this.facebook = data.FacebookID;
    this.google = data.GoogleID;
    this.createdAt = data.CreatedAt;
    this.updatedAt = data.UpdatedAt;
  }

  // Chuyển đổi đối tượng user thành JSON (tương tự hàm toJSON trong mongoose)
  toJSON() {
    const userObject = { ...this };
    delete userObject.password;
    if (userObject.role !== 'superadmin') {
      delete userObject.updatedAt;
    }
    return userObject;
  }

  // Tạo token xác thực
  async generateAuthToken() {
    const user = this;
    const token = jwt.sign({ id: user.id.toString() }, 'mySecret');
    
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('userId', sql.Int, user.id)
        .input('token', sql.NVarChar, token)
        .query('INSERT INTO UserTokens (UserID, Token) VALUES (@userId, @token)');
      
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  }

  // Lưu User vào DB
  async save() {
    try {
      const pool = await poolPromise;
      
      if (this.id) {
        // Update user
        const updateQuery = `
          UPDATE Users 
          SET Name = @name, 
              Username = @username, 
              Email = @email, 
              ${this.password ? 'Password = @password,' : ''} 
              Role = @role, 
              Phone = @phone, 
              ImageUrl = @imageurl, 
              FacebookID = @facebook, 
              GoogleID = @google, 
              UpdatedAt = GETDATE() 
          WHERE ID = @id
        `;
        
        const request = pool.request()
          .input('id', sql.Int, this.id)
          .input('name', sql.NVarChar, this.name)
          .input('username', sql.NVarChar, this.username)
          .input('email', sql.NVarChar, this.email)
          .input('role', sql.NVarChar, this.role || 'guest')
          .input('phone', sql.NVarChar, this.phone)
          .input('imageurl', sql.NVarChar, this.imageurl)
          .input('facebook', sql.NVarChar, this.facebook)
          .input('google', sql.NVarChar, this.google);
          
        if (this.password) {
          request.input('password', sql.NVarChar, this.password);
        }
        
        await request.query(updateQuery);
      } else {
        // Hash password nếu có
        if (this.password) {
          this.password = await bcrypt.hash(this.password, 8);
        }
        
        // Insert user mới
        const result = await pool.request()
          .input('name', sql.NVarChar, this.name)
          .input('username', sql.NVarChar, this.username)
          .input('email', sql.NVarChar, this.email)
          .input('password', sql.NVarChar, this.password)
          .input('role', sql.NVarChar, this.role || 'guest')
          .input('phone', sql.NVarChar, this.phone)
          .input('imageurl', sql.NVarChar, this.imageurl)
          .input('facebook', sql.NVarChar, this.facebook)
          .input('google', sql.NVarChar, this.google)
          .query(`
            INSERT INTO Users (Name, Username, Email, Password, Role, Phone, ImageUrl, FacebookID, GoogleID) 
            OUTPUT INSERTED.ID
            VALUES (@name, @username, @email, @password, @role, @phone, @imageurl, @facebook, @google)
          `);
        
        this.id = result.recordset[0].ID;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  // Xoá User
  async remove() {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .query('DELETE FROM Users WHERE ID = @id');
      
      return this;
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  // Static methods
  static async findById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Users WHERE ID = @id');
      
      if (result.recordset.length === 0) return null;
      
      return new User(result.recordset[0]);
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findOne(criteria) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT * FROM Users WHERE ';
      const request = pool.request();
      
      // Xây dựng điều kiện truy vấn dựa trên các tiêu chí
      const conditions = [];
      Object.keys(criteria).forEach((key, index) => {
        const paramName = `param${index}`;
        
        // Chuyển đổi key từ camelCase sang PascalCase
        const dbKey = key.charAt(0).toUpperCase() + key.slice(1);
        
        conditions.push(`${dbKey} = @${paramName}`);
        request.input(paramName, criteria[key]);
      });
      
      query += conditions.join(' AND ');
      const result = await request.query(query);
      
      if (result.recordset.length === 0) return null;
      
      return new User(result.recordset[0]);
    } catch (error) {
      console.error('Error finding user by criteria:', error);
      throw error;
    }
  }

  static async findByCredentials(username, password) {
    try {
      const user = await this.findOne({ username });
      if (!user) throw new Error('Unable to login');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Unable to login');

      return user;
    } catch (error) {
      console.error('Error in findByCredentials:', error);
      throw error;
    }
  }

  static async find(criteria = {}) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT * FROM Users';
      const request = pool.request();
      
      // Nếu có tiêu chí, thêm vào truy vấn
      if (Object.keys(criteria).length > 0) {
        query += ' WHERE ';
        const conditions = [];
        
        Object.keys(criteria).forEach((key, index) => {
          const paramName = `param${index}`;
          
          // Chuyển đổi key từ camelCase sang PascalCase
          const dbKey = key.charAt(0).toUpperCase() + key.slice(1);
          
          conditions.push(`${dbKey} = @${paramName}`);
          request.input(paramName, criteria[key]);
        });
        
        query += conditions.join(' AND ');
      }
      
      const result = await request.query(query);
      
      return result.recordset.map(record => new User(record));
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  // Kiểm tra token
  static async findByToken(id, token) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('token', sql.NVarChar, token)
        .query(`
          SELECT u.* 
          FROM Users u
          INNER JOIN UserTokens t ON u.ID = t.UserID
          WHERE u.ID = @id AND t.Token = @token
        `);
      
      if (result.recordset.length === 0) return null;
      
      return new User(result.recordset[0]);
    } catch (error) {
      console.error('Error finding user by token:', error);
      throw error;
    }
  }

  // Xác thực thông tin người dùng
  static validateUser(userData) {
    const errors = {};
    
    // Kiểm tra email
    if (userData.email && !validator.isEmail(userData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Kiểm tra mật khẩu
    if (userData.password) {
      if (userData.password.length < 7) {
        errors.password = 'Password must be at least 7 characters long';
      }
      if (userData.password.toLowerCase().includes('password')) {
        errors.password = 'Password should not contain word: password';
      }
    }
    
    // Kiểm tra số điện thoại
    if (userData.phone && !validator.isMobilePhone(userData.phone)) {
      errors.phone = 'Phone is invalid';
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }
}

module.exports = User;