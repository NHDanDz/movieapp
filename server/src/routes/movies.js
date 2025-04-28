const express = require('express');
const auth = require('../middlewares/auth');
const upload = require('../utils/multer');
const Movie = require('../models/movie');
const userModeling = require('../utils/userModeling');
const fs = require('fs');
const path = require('path');

const router = new express.Router();

// Create a movie
router.post('/movies1', auth.enhance, async (req, res) => {
  const movie = new Movie(req.body);
  try {
    await movie.save();
    res.status(201).send(movie);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post(
  '/movies1/photo/:id',
  auth.enhance,
  upload('movies').single('file'),
  async (req, res, next) => {
    try {
      const { file } = req;
      const movieId = req.params.id;
      
      if (!file) {
        const error = new Error('Vui lòng tải lên một file');
        error.httpStatusCode = 400;
        return next(error);
      }
      
      const movie = await Movie.findById(movieId);
      
      if (!movie) return res.sendStatus(404);
      
      // Xóa ảnh cũ nếu có và không phải link ngoài
      if (movie.image && !movie.image.includes('http')) {
        try {
          const oldImagePath = path.join(__dirname, '../../public', movie.image);
          console.log('Checking old image at:', oldImagePath);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log('Deleted old image:', oldImagePath);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
          // Tiếp tục xử lý ngay cả khi không thể xóa ảnh cũ
        }
      }
      
      // Lưu đường dẫn tương đối vào database
      const relativePath = `/movies/${movieId}/${file.filename}`;
      console.log('New image path:', relativePath);
      console.log('File info:', file);
      
      movie.image = relativePath;
      
      await movie.save();
      res.send({ movie, file });
    } catch (e) {
      console.error('Error in upload handler:', e);
      res.status(400).send(e);
    }
  }
);
// Get all movies
router.get('/movies1', async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.send(movies);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Get movie by id
router.get('/movies1/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const movie = await Movie.findById(_id);
    if (!movie) return res.sendStatus(404);
    return res.send(movie);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Update movie by id
router.put('/movies1/:id', auth.enhance, async (req, res) => {
  const _id = req.params.id;
  const updates = Object.keys(req.body);
  console.log(req)
  const allowedUpdates = [
    'title',
    'image',
    'language',
    'genre',
    'director',
    'cast',
    'description',
    'duration',
    'releaseDate',
    'endDate',
  ];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    const movie = await Movie.findById(_id);
    updates.forEach((update) => (movie[update] = req.body[update]));
    await movie.save();
    return !movie ? res.sendStatus(404) : res.send(movie);
  } catch (e) {
    return res.status(400).send(e);
  }
});

// Delete movie by id
router.delete('/movies1/:id', auth.enhance, async (req, res) => {
  const _id = req.params.id;
  try {
    const movie = await Movie.findByIdAndDelete(_id);
    return !movie ? res.sendStatus(404) : res.send(movie);
  } catch (e) {
    return res.sendStatus(400);
  }
});

// Movies User modeling (Get Movies Suggestions)
router.get('/movies1/usermodeling/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const cinemasUserModeled = await userModeling.moviesUserModeling(username);
    res.send(cinemasUserModeled);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
