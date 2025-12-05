const express = require('express');
const router = express.Router();
const ShowtimeController = require('../controllers/ShowtimeController');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/showtimes?movieId=1 - danh sách suất chiếu (có thể filter theo movieId)
router.get('/', asyncHandler(ShowtimeController.getAllShowtimes));

// POST /api/showtimes/batch - tạo nhiều suất chiếu cùng lúc (cần authentication)
// IMPORTANT: This route must be defined BEFORE /:id route to avoid route conflict
router.post('/batch', authenticate, asyncHandler(ShowtimeController.createMultipleShowtimes));

// POST /api/showtimes - tạo suất chiếu mới (cần authentication)
router.post('/', authenticate, asyncHandler(ShowtimeController.createShowtime));

// PUT /api/showtimes/:id - cập nhật suất chiếu (cần authentication)
router.put('/:id', authenticate, asyncHandler(ShowtimeController.updateShowtime));

// DELETE /api/showtimes/:id - xóa suất chiếu (cần authentication)
router.delete('/:id', authenticate, asyncHandler(ShowtimeController.deleteShowtime));

module.exports = router;

