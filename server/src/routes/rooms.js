const express = require('express');
const auth = require('../middlewares/auth');
const Room = require('../models/room');
const Cinema = require('../models/cinema');

const router = new express.Router();

// Lấy tất cả phòng (có thể lọc theo cinemaId)
router.get('/rooms', async (req, res) => {
  try {
    const { cinemaId } = req.query;
    
    // Nếu có cinemaId, lọc theo rạp
    if (cinemaId) {
      const rooms = await Room.findByCinemaId(parseInt(cinemaId));
      return res.status(200).send(rooms);
    }
    
    // Nếu không có cinemaId, lấy tất cả phòng
    const rooms = await Room.find();
    res.status(200).send(rooms);
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).send({ error: 'Lỗi khi lấy danh sách phòng' });
  }
});

// Lấy thông tin phòng theo ID
router.get('/rooms/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(parseInt(roomId));
    
    if (!room) {
      return res.status(404).send({ error: 'Không tìm thấy phòng' });
    }
    
    res.status(200).send(room);
  } catch (error) {
    console.error('Error getting room by ID:', error);
    res.status(500).send({ error: 'Lỗi khi lấy thông tin phòng' });
  }
});

// Thêm phòng mới
router.post('/rooms', auth.enhance, async (req, res) => {
  try {
    const { cinemaId, name, capacity, roomType, ticketPrice, status } = req.body;
    
    // Kiểm tra xem rạp có tồn tại không
    const cinema = await Cinema.findById(parseInt(cinemaId));
    if (!cinema) {
      return res.status(404).send({ error: 'Không tìm thấy rạp' });
    }
    
    // Tạo phòng mới
    const room = new Room({
      CinemaID: cinemaId,
      Name: name,
      Capacity: capacity,
      RoomType: roomType,
      TicketPrice: ticketPrice,
      Status: status || 'active',
    });
    
    // Lưu phòng vào database
    await room.save();
    
    res.status(201).send(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(400).send({ error: 'Lỗi khi tạo phòng mới' });
  }
});

// Cập nhật thông tin phòng
router.patch('/rooms/:id', auth.enhance, async (req, res) => {
  try {
    const roomId = req.params.id;
    const updates = req.body;
    
    // Lấy thông tin phòng hiện tại
    const room = await Room.findById(parseInt(roomId));
    if (!room) {
      return res.status(404).send({ error: 'Không tìm thấy phòng' });
    }
    
    // Cập nhật các thông tin
    if (updates.name) room.name = updates.name;
    if (updates.capacity) room.capacity = updates.capacity;
    if (updates.roomType) room.roomType = updates.roomType;
    if (updates.ticketPrice) room.ticketPrice = updates.ticketPrice;
    if (updates.status) room.status = updates.status;
    
    // Lưu thay đổi
    await room.save();
    
    res.status(200).send(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(400).send({ error: 'Lỗi khi cập nhật thông tin phòng' });
  }
});

// Xóa phòng
router.delete('/rooms/:id', auth.enhance, async (req, res) => {
  try {
    const roomId = req.params.id;
    
    // Lấy thông tin phòng hiện tại
    const room = await Room.findById(parseInt(roomId));
    if (!room) {
      return res.status(404).send({ error: 'Không tìm thấy phòng' });
    }
    
    // Xóa phòng
    await room.remove();
    
    res.status(200).send({ message: 'Xóa phòng thành công', roomId });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).send({ error: 'Lỗi khi xóa phòng' });
  }
});

// Lấy tất cả ghế của phòng
router.get('/rooms/:id/seats', async (req, res) => {
  try {
    const roomId = req.params.id;
    
    // Lấy thông tin phòng hiện tại
    const room = await Room.findById(parseInt(roomId));
    if (!room) {
      return res.status(404).send({ error: 'Không tìm thấy phòng' });
    }
    
    // Lấy danh sách ghế
    const seats = await room.getSeats();
    
    res.status(200).send(seats);
  } catch (error) {
    console.error('Error getting room seats:', error);
    res.status(500).send({ error: 'Lỗi khi lấy danh sách ghế' });
  }
});

// Thêm ghế cho phòng
router.post('/rooms/:id/seats', auth.enhance, async (req, res) => {
  try {
    const roomId = req.params.id;
    const { seats } = req.body;
    
    // Lấy thông tin phòng hiện tại
    const room = await Room.findById(parseInt(roomId));
    if (!room) {
      return res.status(404).send({ error: 'Không tìm thấy phòng' });
    }
    
    // Thêm ghế
    await room.addSeats(seats);
    
    res.status(201).send({ message: 'Thêm ghế thành công' });
  } catch (error) {
    console.error('Error adding seats:', error);
    res.status(400).send({ error: 'Lỗi khi thêm ghế' });
  }
});

// Kiểm tra ghế có khả dụng không
router.post('/rooms/:id/check-seats', async (req, res) => {
  try {
    const roomId = req.params.id;
    const { showtimeId, seats } = req.body;
    
    if (!showtimeId || !seats || !Array.isArray(seats)) {
      return res.status(400).send({ error: 'Thông tin không hợp lệ' });
    }
    
    // Kiểm tra ghế
    const result = await Room.checkSeatsAvailability(
      parseInt(roomId),
      parseInt(showtimeId),
      seats
    );
    
    res.status(200).send(result);
  } catch (error) {
    console.error('Error checking seats availability:', error);
    res.status(500).send({ error: 'Lỗi khi kiểm tra ghế' });
  }
});

module.exports = router;