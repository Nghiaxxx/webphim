const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./lib/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Simple log
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
const moviesRouter = require('./routes/movies');
const promotionsRouter = require('./routes/promotions');
const showtimesRouter = require('./routes/showtimes');
const bookingsRouter = require('./routes/bookings');

app.use('/api/movies', moviesRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/showtimes', showtimesRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'WebPhim API running' });
});

// Start server after DB check
db.getConnection((err, connection) => {
  if (err) {
    console.error('Không kết nối được MySQL:', err);
    process.exit(1);
  }
  if (connection) connection.release();
  app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
});


