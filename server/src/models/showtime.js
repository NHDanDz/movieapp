// server/src/models/showtime.js
const { sql, poolPromise } = require('../db/mssql');

class Showtime {
  constructor(data) {
    this.id = data.ID;
    this.startAt = data.StartAt;
    this.startDate = data.StartDate;
    this.endDate = data.EndDate;
    this.movieId = data.MovieID;
    this.roomId = data.RoomID;
    this.createdAt = data.CreatedAt;
    this.updatedAt = data.UpdatedAt;
  }

  // Lưu suất chiếu vào DB
  async save() {
    try {
      const pool = await poolPromise;
      
      if (this.id) {
        // Update suất chiếu
        await pool.request()
          .input('id', sql.Int, this.id)
          .input('startAt', sql.NVarChar, this.startAt)
          .input('startDate', sql.Date, this.startDate)
          .input('endDate', sql.Date, this.endDate)
          .input('movieId', sql.Int, this.movieId)
          .input('roomId', sql.Int, this.roomId)
          .query(`
            UPDATE Showtimes 
            SET StartAt = @startAt,
                StartDate = @startDate,
                EndDate = @endDate,
                MovieID = @movieId,
                RoomID = @roomId,
                UpdatedAt = GETDATE()
            WHERE ID = @id
          `);
      } else {
        // Thêm suất chiếu mới
        const result = await pool.request()
          .input('startAt', sql.NVarChar, this.startAt)
          .input('startDate', sql.Date, this.startDate)
          .input('endDate', sql.Date, this.endDate)
          .input('movieId', sql.Int, this.movieId)
          .input('roomId', sql.Int, this.roomId)
          .query(`
            INSERT INTO Showtimes (StartAt, StartDate, EndDate, MovieID, RoomID)
            OUTPUT INSERTED.ID
            VALUES (@startAt, @startDate, @endDate, @movieId, @roomId)
          `);
          
        this.id = result.recordset[0].ID;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving showtime:', error);
      throw error;
    }
  }

  // Xóa suất chiếu
  async remove() {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .query('DELETE FROM Showtimes WHERE ID = @id');
      
      return this;
    } catch (error) {
      console.error('Error removing showtime:', error);
      throw error;
    }
  }

  // Lấy thông tin chi tiết của suất chiếu bao gồm thông tin phim và phòng chiếu
  async getDetails() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, this.id)
        .query(`
          SELECT s.*, 
                 m.Title AS MovieTitle, m.Image AS MovieImage, m.Duration AS MovieDuration,
                 r.Name AS RoomName, r.RoomType,
                 c.Name AS CinemaName, c.City AS CinemaCity
          FROM Showtimes s
          JOIN Movies m ON s.MovieID = m.ID
          JOIN Rooms r ON s.RoomID = r.ID
          JOIN Cinemas c ON r.CinemaID = c.ID
          WHERE s.ID = @id
        `);
      
      if (result.recordset.length === 0) return null;
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error getting showtime details:', error);
      throw error;
    }
  }

  // Lấy danh sách ghế đã đặt cho suất chiếu
  async getReservedSeats() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, this.id)
        .query(`
          SELECT rs.RowName, rs.SeatNumber
          FROM ReservationSeats rs
          JOIN Reservations r ON rs.ReservationID = r.ID
          WHERE r.ShowtimeID = @id
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error getting reserved seats for showtime:', error);
      throw error;
    }
  }

  // Static methods
  static async findById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Showtimes WHERE ID = @id');
      
      if (result.recordset.length === 0) return null;
      
      return new Showtime(result.recordset[0]);
    } catch (error) {
      console.error('Error finding showtime by ID:', error);
      throw error;
    }
  }

  static async find(criteria = {}) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT * FROM Showtimes';
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
      
      return result.recordset.map(record => new Showtime(record));
    } catch (error) {
      console.error('Error finding showtimes:', error);
      throw error;
    }
  }

  // Lấy tất cả suất chiếu của một phim
  static async findByMovieId(movieId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('movieId', sql.Int, movieId)
        .query(`
          SELECT s.*, 
                 r.Name AS RoomName, r.RoomType, r.TicketPrice,
                 c.Name AS CinemaName, c.City
          FROM Showtimes s
          JOIN Rooms r ON s.RoomID = r.ID
          JOIN Cinemas c ON r.CinemaID = c.ID
          WHERE s.MovieID = @movieId AND s.EndDate >= GETDATE()
          ORDER BY s.StartDate, s.StartAt
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error finding showtimes by movie ID:', error);
      throw error;
    }
  }

  // Lấy tất cả suất chiếu của một rạp
  static async findByCinemaId(cinemaId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('cinemaId', sql.Int, cinemaId)
        .query(`
          SELECT s.*, 
                 m.Title AS MovieTitle, m.Image AS MovieImage,
                 r.Name AS RoomName, r.RoomType
          FROM Showtimes s
          JOIN Movies m ON s.MovieID = m.ID
          JOIN Rooms r ON s.RoomID = r.ID
          WHERE r.CinemaID = @cinemaId AND s.EndDate >= GETDATE()
          ORDER BY s.StartDate, s.StartAt
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error finding showtimes by cinema ID:', error);
      throw error;
    }
  }

  // Kiểm tra xung đột lịch chiếu
  static async checkConflict(roomId, startDate, startAt, duration, excludeShowtimeId = null) {
    try {
      const pool = await poolPromise;
      const request = pool.request()
        .input('roomId', sql.Int, roomId)
        .input('startDate', sql.Date, startDate)
        .input('startAt', sql.NVarChar, startAt)
        .input('duration', sql.Int, duration);
      
      let query = `
        SELECT s.ID, s.StartAt, m.Title AS MovieTitle, m.Duration
        FROM Showtimes s
        JOIN Movies m ON s.MovieID = m.ID
        WHERE s.RoomID = @roomId AND s.StartDate = @startDate
      `;
      
      if (excludeShowtimeId) {
        query += ' AND s.ID <> @excludeShowtimeId';
        request.input('excludeShowtimeId', sql.Int, excludeShowtimeId);
      }
      
      const result = await request.query(query);
      
      // Chuyển startAt từ string sang số phút trong ngày
      const timeToMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const newShowStartMinutes = timeToMinutes(startAt);
      const newShowEndMinutes = newShowStartMinutes + duration;
      
      // Kiểm tra xung đột
      for (const showtime of result.recordset) {
        const existingShowStartMinutes = timeToMinutes(showtime.StartAt);
        const existingShowEndMinutes = existingShowStartMinutes + showtime.Duration;
        
        // Kiểm tra nếu có xung đột thời gian
        if (
          (newShowStartMinutes >= existingShowStartMinutes && newShowStartMinutes < existingShowEndMinutes) ||
          (newShowEndMinutes > existingShowStartMinutes && newShowEndMinutes <= existingShowEndMinutes) ||
          (newShowStartMinutes <= existingShowStartMinutes && newShowEndMinutes >= existingShowEndMinutes)
        ) {
          return {
            hasConflict: true,
            conflictShowtime: showtime
          };
        }
      }
      
      return {
        hasConflict: false
      };
    } catch (error) {
      console.error('Error checking showtime conflict:', error);
      throw error;
    }
  }
}

module.exports = Showtime;