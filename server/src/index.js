const express = require('express');
const path = require('path');
const cors = require('cors');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
}

// Kết nối SQL Server
require('./db/mssql');

// Routes
const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const cinemaRouter = require('./routes/cinema');
const showtimeRouter = require('./routes/showtime');
const reservationRouter = require('./routes/reservation');
const invitationsRouter = require('./routes/invitations');
const roomRouter = require('./routes/rooms'); // Thêm routes cho phòng chiếu

const app = express();
app.disable('x-powered-by');
const port = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));
app.use('/movies', express.static(path.join(__dirname, '../../../public/movies1')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware để log request để dễ debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(userRouter);
app.use(movieRouter);
app.use(cinemaRouter);
app.use(showtimeRouter);
app.use(reservationRouter);
app.use(invitationsRouter);
app.use(roomRouter); // Sử dụng routes cho phòng chiếu

// Thêm route test API
app.get('/api/test', (req, res) => res.send('API server is running'));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
  console.log(`Serving static files from: ${path.join(__dirname, '../../public')}`);
});