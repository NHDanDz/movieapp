// server/src/models/room.js
const { sql, poolPromise } = require('../db/mssql');

class Room {
  constructor(data) {
    this.id = data.ID;
    this.cinemaId = data.CinemaID;
    this.name = data.Name;
    this.capacity = data.Capacity;
    this.roomType = data.RoomType;
    this.ticketPrice = data.TicketPrice;
    this.status = data.Status;
    this.createdAt = data.CreatedAt;
    this.updatedAt = data.UpdatedAt;
  }

  // Lưu phòng chiếu vào DB
  async save() {
    try {
      const pool = await poolPromise;
      
      if (this.id) {
        // Update phòng chiếu
        await pool.request()
          .input('id', sql.Int, this.id)
          .input('cinemaId', sql.Int, this.cinemaId)
          .input('name', sql.NVarChar, this.name)
          .input('capacity', sql.Int, this.capacity)
          .input('roomType', sql.NVarChar, this.roomType)
          .input('ticketPrice', sql.Decimal(10, 2), this.ticketPrice)
          .input('status', sql.NVarChar, this.status || 'active')
          .query(`
            UPDATE Rooms 
            SET CinemaID = @cinemaId,
                Name = @name,
                Capacity = @capacity,
                RoomType = @roomType,
                TicketPrice = @ticketPrice,
                Status = @status,
                UpdatedAt = GETDATE()
            WHERE ID = @id
          `);
      } else {
        // Thêm phòng chiếu mới
        const result = await pool.request()
          .input('cinemaId', sql.Int, this.cinemaId)
          .input('name', sql.NVarChar, this.name)
          .input('capacity', sql.Int, this.capacity)
          .input('roomType', sql.NVarChar, this.roomType)
          .input('ticketPrice', sql.Decimal(10, 2), this.ticketPrice)
          .input('status', sql.NVarChar, this.status || 'active')
          .query(`
            INSERT INTO Rooms (CinemaID, Name, Capacity, RoomType, TicketPrice, Status)
            OUTPUT INSERTED.ID
            VALUES (@cinemaId, @name, @capacity, @roomType, @ticketPrice, @status)
          `);
          
        this.id = result.recordset[0].ID;
      }
      
      return this;
    } catch (error) {
      console.error('Error saving room:', error);
      throw error;
    }
  }

  // Xóa phòng chiếu
  async remove() {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .query('DELETE FROM Rooms WHERE ID = @id');
      
      return this;
    } catch (error) {
      console.error('Error removing room:', error);
      throw error;
    }
  }

  // Thêm ghế cho phòng chiếu
  async addSeats(seats) {
    try {
      const pool = await poolPromise;
      const transaction = new sql.Transaction(pool);
      
      await transaction.begin();
      
      try {
        for (const seat of seats) {
          await pool.request()
            .input('roomId', sql.Int, this.id)
            .input('rowName', sql.NVarChar, seat.rowName)
            .input('seatNumber', sql.NVarChar, seat.seatNumber)
            .input('seatType', sql.NVarChar, seat.seatType || 'standard')
            .input('extraCharge', sql.Decimal(10, 2), seat.extraCharge || 0)
            .input('status', sql.NVarChar, seat.status || 'active')
            .query(`
              INSERT INTO RoomSeats (RoomID, RowName, SeatNumber, SeatType, ExtraCharge, Status)
              VALUES (@roomId, @rowName, @seatNumber, @seatType, @extraCharge, @status)
            `);
        }
        
        await transaction.commit();
        return true;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error adding seats to room:', error);
      throw error;
    }
  }

  // Lấy tất cả ghế của phòng chiếu
  async getSeats() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('roomId', sql.Int, this.id)
        .query('SELECT * FROM RoomSeats WHERE RoomID = @roomId');
      
      return result.recordset;
    } catch (error) {
      console.error('Error getting room seats:', error);
      throw error;
    }
  }

  // Static methods
  static async findById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Rooms WHERE ID = @id');
      
      if (result.recordset.length === 0) return null;
      
      return new Room(result.recordset[0]);
    } catch (error) {
      console.error('Error finding room by ID:', error);
      throw error;
    }
  }

  static async find(criteria = {}) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT * FROM Rooms';
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
      
      return result.recordset.map(record => new Room(record));
    } catch (error) {
      console.error('Error finding rooms:', error);
      throw error;
    }
  }

  // Lấy tất cả phòng chiếu của một rạp
  static async findByCinemaId(cinemaId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('cinemaId', sql.Int, cinemaId)
        .query('SELECT * FROM Rooms WHERE CinemaID = @cinemaId');
      
      return result.recordset.map(record => new Room(record));
    } catch (error) {
      console.error('Error finding rooms by cinema ID:', error);
      throw error;
    }
  }

  // Kiểm tra ghế có khả dụng cho một showtime không
  static async checkSeatsAvailability(roomId, showtimeId, selectedSeats) {
    try {
      const pool = await poolPromise;
      
      // Lấy danh sách ghế đã đặt cho suất chiếu này
      const result = await pool.request()
        .input('roomId', sql.Int, roomId)
        .input('showtimeId', sql.Int, showtimeId)
        .query(`
          SELECT rs.RowName, rs.SeatNumber
          FROM ReservationSeats rs
          JOIN Reservations r ON rs.ReservationID = r.ID
          WHERE r.RoomID = @roomId AND r.ShowtimeID = @showtimeId
        `);
      
      const reservedSeats = result.recordset.map(seat => `${seat.RowName}-${seat.SeatNumber}`);
      
      // Nếu không có ghế cần kiểm tra, trả về tất cả ghế đã đặt
      if (!selectedSeats || selectedSeats.length === 0) {
        return {
          available: true,
          reservedSeats
        };
      }
      
      // Kiểm tra xem ghế được chọn có nằm trong danh sách ghế đã đặt không
      const unavailableSeats = [];
      for (const seat of selectedSeats) {
        const seatKey = `${seat.rowName}-${seat.seatNumber}`;
        if (reservedSeats.includes(seatKey)) {
          unavailableSeats.push(seatKey);
        }
      }
      
      return {
        available: unavailableSeats.length === 0,
        unavailableSeats,
        reservedSeats
      };
    } catch (error) {
      console.error('Error checking seats availability:', error);
      throw error;
    }
  }
}

module.exports = Room;