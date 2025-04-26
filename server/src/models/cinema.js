// server/src/models/cinema.js
const { sql, poolPromise } = require('../db/mssql');
const Room = require('./room');

class Cinema {
  constructor(data) {
    this.id = data.ID;
    this.name = data.Name;
    this.city = data.City;
    this.image = data.Image;
    this.createdAt = data.CreatedAt;
    this.updatedAt = data.UpdatedAt;
  }

  // Lưu rạp phim vào DB
  async save() {
    try {
      const pool = await poolPromise;
      
      if (this.id) {
        // Update rạp phim
        await pool.request()
          .input('id', sql.Int, this.id)
          .input('name', sql.NVarChar, this.name)
          .input('city', sql.NVarChar, this.city)
          .input('image', sql.NVarChar, this.image)
          .query(`
            UPDATE Cinemas 
            SET Name = @name,
                City = @city,
                Image = @image,
                UpdatedAt = GETDATE()
            WHERE ID = @id
          `);
      } else {
        // Thêm rạp phim mới
        const result = await pool.request()
          .input('name', sql.NVarChar, this.name)
          .input('city', sql.NVarChar, this.city)
          .input('image', sql.NVarChar, this.image)
          .query(`
            INSERT INTO Cinemas (Name, City, Image)
            OUTPUT INSERTED.ID
            VALUES (@name, @city, @image)
          `);
          
        this.id = result.recordset[0].ID;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving cinema:', error);
      throw error;
    }
  }

  // Xóa rạp phim
  async remove() {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .query('DELETE FROM Cinemas WHERE ID = @id');
      
      return this;
    } catch (error) {
      console.error('Error removing cinema:', error);
      throw error;
    }
  }

  // Lấy tất cả phòng chiếu của rạp
  async getRooms() {
    try {
      return await Room.findByCinemaId(this.id);
    } catch (error) {
      console.error('Error getting cinema rooms:', error);
      throw error;
    }
  }

  // Lấy tổng số ghế của rạp
  async getTotalSeats() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('cinemaId', sql.Int, this.id)
        .query(`
          SELECT SUM(r.Capacity) AS TotalSeats
          FROM Rooms r
          WHERE r.CinemaID = @cinemaId AND r.Status = 'active'
        `);
      
      return result.recordset[0].TotalSeats || 0;
    } catch (error) {
      console.error('Error getting total seats:', error);
      throw error;
    }
  }

  // Static methods
  static async findById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Cinemas WHERE ID = @id');
      
      if (result.recordset.length === 0) return null;
      
      return new Cinema(result.recordset[0]);
    } catch (error) {
      console.error('Error finding cinema by ID:', error);
      throw error;
    }
  }

  static async find(criteria = {}) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT * FROM Cinemas';
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
      
      return result.recordset.map(record => new Cinema(record));
    } catch (error) {
      console.error('Error finding cinemas:', error);
      throw error;
    }
  }

  // Lấy tất cả rạp phim cùng với thông tin phòng chiếu
  static async findWithRooms() {
    try {
      const pool = await poolPromise;
      const cinemasResult = await pool.request().query(`
        SELECT c.*, 
               (SELECT COUNT(*) FROM Rooms WHERE CinemaID = c.ID) AS RoomCount,
               (SELECT SUM(Capacity) FROM Rooms WHERE CinemaID = c.ID) AS TotalCapacity
        FROM Cinemas c
      `);
      
      const cinemas = [];
      
      for (const cinemaData of cinemasResult.recordset) {
        const cinema = new Cinema(cinemaData);
        cinema.roomCount = cinemaData.RoomCount;
        cinema.totalCapacity = cinemaData.TotalCapacity;
        
        const roomsResult = await pool.request()
          .input('cinemaId', sql.Int, cinema.id)
          .query('SELECT * FROM Rooms WHERE CinemaID = @cinemaId');
        
        cinema.rooms = roomsResult.recordset.map(room => ({
          id: room.ID,
          name: room.Name,
          capacity: room.Capacity,
          roomType: room.RoomType,
          ticketPrice: room.TicketPrice
        }));
        
        cinemas.push(cinema);
      }
      
      return cinemas;
    } catch (error) {
      console.error('Error finding cinemas with rooms:', error);
      throw error;
    }
  }

  // Tìm rạp phim phổ biến cho user (user modeling)
  static async findPopularForUser(username) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query(`
          SELECT c.*, COUNT(r.ID) AS VisitCount
          FROM Cinemas c
          JOIN Reservations r ON c.ID = r.CinemaID
          JOIN Users u ON r.UserID = u.ID
          WHERE u.Username = @username
          GROUP BY c.ID, c.Name, c.City, c.Image, c.CreatedAt, c.UpdatedAt
          ORDER BY VisitCount DESC
        `);
      
      return result.recordset.map(record => {
        const cinema = new Cinema(record);
        cinema.visitCount = record.VisitCount;
        return cinema;
      });
    } catch (error) {
      console.error('Error finding popular cinemas for user:', error);
      throw error;
    }
  }
}

module.exports = Cinema;