// server/src/models/reservation.js
const { sql, poolPromise } = require('../db/mssql');
const generateQR = require('../utils/generateQRCode');

class Reservation {
  constructor(data) {
    this.id = data.ID;
    this.date = data.Date;
    this.startAt = data.StartAt;
    this.ticketPrice = data.TicketPrice;
    this.total = data.Total;
    this.userId = data.UserID;
    this.movieId = data.MovieID;
    this.showtimeId = data.ShowtimeID;
    this.roomId = data.RoomID;
    this.cinemaId = data.CinemaID;
    this.username = data.Username;
    this.phone = data.Phone;
    this.checkin = data.Checkin;
    this.paymentStatus = data.PaymentStatus;
    this.qrCode = data.QRCode;
    this.createdAt = data.CreatedAt;
    this.updatedAt = data.UpdatedAt;
    this.seats = data.Seats || []; // Mảng ghế được chọn
  }

  // Lưu đặt vé vào DB
  async save() {
    try {
      const pool = await poolPromise;
      const transaction = new sql.Transaction(pool);
      
      await transaction.begin();
      
      try {
        // Đảm bảo trường date có giá trị
        if (!this.date) {
          this.date = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        }
        if (!this.startAt) {
          // Lấy giờ hiện tại làm thời gian bắt đầu mặc định (format HH:MM)
          const now = new Date();
          this.startAt = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        }
        // Nếu không có QR code, tạo QR code mới
        if (!this.qrCode) {
          const qrCodeUrl = `https://cinema-booking.com/tickets/verify/${this.id || 'new'}`;
          this.qrCode = await generateQR(qrCodeUrl);
        }
        
        if (this.id) {
          // Update đặt vé
          await pool.request()
            .input('id', sql.Int, this.id)
            .input('date', sql.Date, this.date)
            .input('startAt', sql.NVarChar, this.startAt)
            .input('ticketPrice', sql.Decimal(10, 2), this.ticketPrice)
            .input('total', sql.Decimal(10, 2), this.total)
            .input('userId', sql.Int, this.userId)
            .input('movieId', sql.Int, this.movieId)
            .input('showtimeId', sql.Int, this.showtimeId)
            .input('roomId', sql.Int, this.roomId)
            .input('cinemaId', sql.Int, this.cinemaId)
            .input('username', sql.NVarChar, this.username)
            .input('phone', sql.NVarChar, this.phone)
            .input('checkin', sql.Bit, this.checkin)
            .input('paymentStatus', sql.NVarChar, this.paymentStatus)
            .input('qrCode', sql.NVarChar, this.qrCode)
            .query(`
              UPDATE Reservations 
              SET Date = @date,
                  StartAt = @startAt,
                  TicketPrice = @ticketPrice,
                  Total = @total,
                  UserID = @userId,
                  MovieID = @movieId,
                  ShowtimeID = @showtimeId,
                  RoomID = @roomId,
                  CinemaID = @cinemaId,
                  Username = @username,
                  Phone = @phone,
                  Checkin = @checkin,
                  PaymentStatus = @paymentStatus,
                  QRCode = @qrCode,
                  UpdatedAt = GETDATE()
              WHERE ID = @id
            `);
            
          // Xóa ghế đã đặt cũ nếu có cập nhật ghế mới
          if (this.seats && this.seats.length > 0) {
            await pool.request()
              .input('reservationId', sql.Int, this.id)
              .query('DELETE FROM ReservationSeats WHERE ReservationID = @reservationId');
              
            // Thêm ghế mới
            for (const seat of this.seats) {
              await pool.request()
                .input('reservationId', sql.Int, this.id)
                .input('roomSeatId', sql.Int, seat.seatId || null)
                .input('rowName', sql.NVarChar, seat.rowName)
                .input('seatNumber', sql.NVarChar, seat.seatNumber)
                .input('seatPrice', sql.Decimal(10, 2), seat.seatPrice || this.ticketPrice)
                .query(`
                  INSERT INTO ReservationSeats (ReservationID, RoomSeatID, RowName, SeatNumber, SeatPrice)
                  VALUES (@reservationId, @roomSeatId, @rowName, @seatNumber, @seatPrice)
                `);
            }
          }
        } else {
          // Thêm đặt vé mới
          const result = await pool.request()
            .input('date', sql.Date, this.date)
            .input('startAt', sql.NVarChar, this.startAt)
            .input('ticketPrice', sql.Decimal(10, 2), this.ticketPrice)
            .input('total', sql.Decimal(10, 2), this.total)
            .input('userId', sql.Int, this.userId)
            .input('movieId', sql.Int, this.movieId)
            .input('showtimeId', sql.Int, this.showtimeId)
            .input('roomId', sql.Int, this.roomId)
            .input('cinemaId', sql.Int, this.cinemaId)
            .input('username', sql.NVarChar, this.username)
            .input('phone', sql.NVarChar, this.phone)
            .input('checkin', sql.Bit, this.checkin || false)
            .input('paymentStatus', sql.NVarChar, this.paymentStatus || 'pending')
            .input('qrCode', sql.NVarChar, this.qrCode)
            .query(`
              INSERT INTO Reservations (
                Date, StartAt, TicketPrice, Total, UserID, MovieID, ShowtimeID, 
                RoomID, CinemaID, Username, Phone, Checkin, PaymentStatus, QRCode
              )
              OUTPUT INSERTED.ID
              VALUES (
                @date, @startAt, @ticketPrice, @total, @userId, @movieId, @showtimeId,
                @roomId, @cinemaId, @username, @phone, @checkin, @paymentStatus, @qrCode
              )
            `);
            
          this.id = result.recordset[0].ID;
          
          // Thêm ghế đã đặt
          if (this.seats && this.seats.length > 0) {
            for (const seat of this.seats) {
              await pool.request()
                .input('reservationId', sql.Int, this.id)
                .input('roomSeatId', sql.Int, seat.seatId || null)
                .input('rowName', sql.NVarChar, seat.rowName)
                .input('seatNumber', sql.NVarChar, seat.seatNumber)
                .input('seatPrice', sql.Decimal(10, 2), seat.seatPrice || this.ticketPrice)
                .query(`
                  INSERT INTO ReservationSeats (ReservationID, RoomSeatID, RowName, SeatNumber, SeatPrice)
                  VALUES (@reservationId, @roomSeatId, @rowName, @seatNumber, @seatPrice)
                `);
            }
          }
        }
        
        await transaction.commit();
        return this;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error saving reservation:', error);
      throw error;
    }
  }

  // Xóa đặt vé
  async remove() {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .query('DELETE FROM Reservations WHERE ID = @id');
      
      return this;
    } catch (error) {
      console.error('Error removing reservation:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái check-in
  async updateCheckin(status = true) {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .input('checkin', sql.Bit, status)
        .query('UPDATE Reservations SET Checkin = @checkin, UpdatedAt = GETDATE() WHERE ID = @id');
      
      this.checkin = status;
      return this;
    } catch (error) {
      console.error('Error updating checkin status:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái thanh toán
  async updatePaymentStatus(status) {
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('id', sql.Int, this.id)
        .input('status', sql.NVarChar, status)
        .query('UPDATE Reservations SET PaymentStatus = @status, UpdatedAt = GETDATE() WHERE ID = @id');
      
      this.paymentStatus = status;
      return this;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Lấy chi tiết ghế đã đặt
  async getSeats() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, this.id)
        .query(`
          SELECT rs.*, s.SeatType, s.ExtraCharge
          FROM ReservationSeats rs
          LEFT JOIN RoomSeats s ON rs.RoomSeatID = s.ID
          WHERE rs.ReservationID = @id
        `);
      
      this.seats = result.recordset;
      return result.recordset;
    } catch (error) {
      console.error('Error getting reservation seats:', error);
      throw error;
    }
  }

  // Lấy thông tin chi tiết của đặt vé
  async getDetails() {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, this.id)
        .query(`
          SELECT r.*,
                 m.Title AS MovieTitle, m.Image AS MovieImage, m.Duration AS MovieDuration,
                 c.Name AS CinemaName, c.City AS CinemaCity,
                 room.Name AS RoomName, room.RoomType
          FROM Reservations r
          JOIN Movies m ON r.MovieID = m.ID
          JOIN Cinemas c ON r.CinemaID = c.ID
          JOIN Rooms room ON r.RoomID = room.ID
          WHERE r.ID = @id
        `);
      
      if (result.recordset.length === 0) return null;
      
      // Lấy thông tin ghế
      const seatsResult = await pool.request()
        .input('id', sql.Int, this.id)
        .query(`
          SELECT rs.*
          FROM ReservationSeats rs
          WHERE rs.ReservationID = @id
        `);
      
      const details = result.recordset[0];
      details.Seats = seatsResult.recordset;
      
      return details;
    } catch (error) {
      console.error('Error getting reservation details:', error);
      throw error;
    }
  }

  // Static methods
  static async findById(id) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM Reservations WHERE ID = @id');
      
      if (result.recordset.length === 0) return null;
      
      const reservation = new Reservation(result.recordset[0]);
      
      // Lấy thông tin ghế
      const seatsResult = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM ReservationSeats WHERE ReservationID = @id');
      
      reservation.seats = seatsResult.recordset;
      
      return reservation;
    } catch (error) {
      console.error('Error finding reservation by ID:', error);
      throw error;
    }
  }

  static async find(criteria = {}) {
    try {
      const pool = await poolPromise;
      let query = `
        SELECT r.*, 
               m.Title AS MovieTitle,
               c.Name AS CinemaName
        FROM Reservations r
        JOIN Movies m ON r.MovieID = m.ID
        JOIN Cinemas c ON r.CinemaID = c.ID
      `;
      
      const request = pool.request();
      
      // Nếu có tiêu chí, thêm vào truy vấn
      if (Object.keys(criteria).length > 0) {
        query += ' WHERE ';
        const conditions = [];
        
        Object.keys(criteria).forEach((key, index) => {
          const paramName = `param${index}`;
          
          // Chuyển đổi key từ camelCase sang PascalCase
          const dbKey = key.charAt(0).toUpperCase() + key.slice(1);
          
          conditions.push(`r.${dbKey} = @${paramName}`);
          request.input(paramName, criteria[key]);
        });
        
        query += conditions.join(' AND ');
      }
      
      query += ' ORDER BY r.CreatedAt DESC';
      
      const result = await request.query(query);
      
      const reservations = [];
      
      for (const record of result.recordset) {
        const reservation = new Reservation(record);
        reservation.movieTitle = record.MovieTitle;
        reservation.cinemaName = record.CinemaName;
        
        // Lấy thông tin ghế
        const seatsResult = await pool.request()
          .input('id', sql.Int, reservation.id)
          .query('SELECT * FROM ReservationSeats WHERE ReservationID = @id');
        
        reservation.seats = seatsResult.recordset;
        
        reservations.push(reservation);
      }
      
      return reservations;
    } catch (error) {
      console.error('Error finding reservations:', error);
      throw error;
    }
  }

  // Lấy các đặt vé của user
  static async findByUserId(userId) {
    return this.find({ userId });
  }

  // Lấy các đặt vé của user theo username
  static async findByUsername(username) {
    return this.find({ username });
  }

  // Kiểm tra ghế có khả dụng cho một showtime không
  static async checkSeatsAvailability(showtimeId, selectedSeats) {
    try {
      const pool = await poolPromise;
      
      // Lấy danh sách ghế đã đặt cho suất chiếu này
      const result = await pool.request()
        .input('showtimeId', sql.Int, showtimeId)
        .query(`
          SELECT rs.RowName, rs.SeatNumber
          FROM ReservationSeats rs
          JOIN Reservations r ON rs.ReservationID = r.ID
          WHERE r.ShowtimeID = @showtimeId
        `);
      
      const reservedSeats = result.recordset.map(seat => `${seat.RowName}-${seat.SeatNumber}`);
      
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
        unavailableSeats
      };
    } catch (error) {
      console.error('Error checking seats availability:', error);
      throw error;
    }
  }

  // Lấy thông tin ghế được đề xuất cho user (user modeling)
  static async getSuggestedSeats(username) {
    try {
      const pool = await poolPromise;
      
      // Lấy thống kê vị trí ghế ưa thích của user
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query(`
          WITH UserSeats AS (
            SELECT rs.RowName, rs.SeatNumber, room.Capacity
            FROM ReservationSeats rs
            JOIN Reservations r ON rs.ReservationID = r.ID
            JOIN Rooms room ON r.RoomID = room.ID
            JOIN Users u ON r.UserID = u.ID
            WHERE u.Username = @username
          ),
          SeatPositions AS (
            SELECT 
              CASE 
                WHEN CAST(RowName AS INT) <= Capacity / 3 THEN 'front'
                WHEN CAST(RowName AS INT) <= 2 * Capacity / 3 THEN 'center'
                ELSE 'back'
              END AS Position,
              COUNT(*) AS Count
            FROM UserSeats
            GROUP BY 
              CASE 
                WHEN CAST(RowName AS INT) <= Capacity / 3 THEN 'front'
                WHEN CAST(RowName AS INT) <= 2 * Capacity / 3 THEN 'center'
                ELSE 'back'
              END
          )
          SELECT Position, Count
          FROM SeatPositions
          ORDER BY Count DESC
        `);
      
      // Lấy số vé trung bình cho mỗi lần đặt
      const ticketCountResult = await pool.request()
        .input('username', sql.NVarChar, username)
        .query(`
          WITH ReservationTicketCount AS (
            SELECT r.ID, COUNT(rs.ID) AS TicketCount
            FROM Reservations r
            JOIN ReservationSeats rs ON r.ID = rs.ReservationID
            JOIN Users u ON r.UserID = u.ID
            WHERE u.Username = @username
            GROUP BY r.ID
          )
          SELECT AVG(TicketCount) AS AvgTickets
          FROM ReservationTicketCount
        `);
      
      // Nếu không có dữ liệu, trả về mặc định
      if (result.recordset.length === 0) {
        return {
          preferredPosition: 'center',
          avgTickets: 2
        };
      }
      
      return {
        preferredPosition: result.recordset[0].Position,
        avgTickets: Math.round(ticketCountResult.recordset[0].AvgTickets) || 2
      };
    } catch (error) {
      console.error('Error getting suggested seats:', error);
      throw error;
    }
  }
}

module.exports = Reservation;