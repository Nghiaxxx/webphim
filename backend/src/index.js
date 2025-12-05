const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./lib/db');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// CORS configuration - allow requests from frontend domain
const allowedOrigins = [
  'https://nghiaht.io.vn',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development, restrict in production if needed
    }
  },
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
const movieRoutes = require('./routes/movieRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

app.use('/api/movies', movieRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/admin/revenue', revenueRoutes);
app.use('/api/admin/settings', settingsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'WebPhim API running' });
});

// API root endpoint
app.get('/api', (req, res) => {
  res.json({ message: 'WebPhim API running' });
});

// Error handler middleware (must be last)
app.use(errorHandler);

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


