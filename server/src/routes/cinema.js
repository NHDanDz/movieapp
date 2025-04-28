const express = require('express');
const auth = require('../middlewares/auth');
const upload = require('../utils/multer');
const Cinema = require('../models/cinema');
const userModeling = require('../utils/userModeling');

const router = new express.Router();

// Create a cinema
router.post('/cinemas', auth.enhance, async (req, res) => {
  const cinema = new Cinema(req.body);
  try {
    await cinema.save();
    res.status(201).send(cinema);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post(
  '/cinemas/photo/:id',
  auth.enhance,
  upload('cinemas').single('file'),
  async (req, res, next) => {
    try {
      const { file } = req;
      const cinemaId = req.params.id;
      
      if (!file) {
        const error = new Error('Vui lòng tải lên một file');
        error.httpStatusCode = 400;
        return next(error);
      }
      
      const cinema = await Cinema.findById(cinemaId);
      if (!cinema) return res.sendStatus(404);

      // Xóa ảnh cũ nếu có và không phải link ngoài
      if (cinema.image && !cinema.image.includes('http')) {
        try {
          const oldImagePath = path.join(__dirname, '../../public', cinema.image);
          console.log('Checking old cinema image at:', oldImagePath);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Deleted old cinema image:', oldImagePath);
          }
        } catch (err) {
          console.error('Error deleting old cinema image:', err);
          // Tiếp tục xử lý ngay cả khi không thể xóa ảnh cũ
        }
      }
      
      // Lưu đường dẫn tương đối vào database
      const relativePath = `/cinemas/${cinemaId}/${file.filename}`;
      console.log('New cinema image path:', relativePath);
      console.log('Uploaded file info:', file);
      
      cinema.image = relativePath;
      
      await cinema.save();
      res.send({ cinema, file });
    } catch (e) {
      console.error('Error in cinema upload handler:', e);
      res.status(400).send(e);
    }
  }
);


// Get all cinemas
router.get('/cinemas', async (req, res) => {
  try {
    const cinemas = await Cinema.find({});
    res.send(cinemas);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get cinema by id
router.get('/cinemas/:id', async (req, res) => {
  const _id = req.params.id;
  try {
    const cinema = await Cinema.findById(_id);
    if (!cinema) return res.sendStatus(404);
    return res.send(cinema);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Update cinema by id
router.patch('/cinemas/:id', auth.enhance, async (req, res) => {
  const _id = req.params.id;
  console.log('==== SERVER LOG - UPDATE CINEMA ====');
  console.log('Cinema ID from params:', _id);
  console.log('Request body:', req.body);
  console.log('Request headers:', req.headers);
  
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'ticketPrice', 'city', 'seats', 'seatsAvailable', 'image'];
  console.log('Updates requested:', updates);
  
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
  console.log('Is valid operation:', isValidOperation);

  if (!isValidOperation) {
    console.log('Invalid updates requested!', updates);
    return res.status(400).send({ 
      error: 'Invalid updates!',
      allowedUpdates,
      receivedUpdates: updates
    });
  }

  try {
    const cinema = await Cinema.findById(_id);
    console.log('Found cinema:', cinema);
    
    if (!cinema) {
      console.log('Cinema not found with ID:', _id);
      return res.sendStatus(404);
    }
    
    updates.forEach((update) => {
      console.log(`Updating ${update} from ${cinema[update]} to ${req.body[update]}`);
      cinema[update] = req.body[update];
    });
    
    await cinema.save();
    console.log('Cinema updated successfully:', cinema);
    return res.send(cinema);
  } catch (e) {
    console.error('Server error updating cinema:', e);
    return res.status(400).send({
      error: e.message,
      details: e.stack
    });
  }
});

// Delete cinema by id
router.delete('/cinemas/:id', auth.enhance, async (req, res) => {
  const _id = req.params.id;
  try {
    const cinema = await Cinema.findByIdAndDelete(_id);
    if (!cinema) return res.sendStatus(404);
    return res.send(cinema);
  } catch (e) {
    return res.sendStatus(400);
  }
});

// Cinema User modeling (GET ALL CINEMAS)
router.get('/cinemas/usermodeling/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const cinemas = await Cinema.find({});
    const cinemasUserModeled = await userModeling.cinemaUserModeling(cinemas, username);
    res.send(cinemasUserModeled);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
