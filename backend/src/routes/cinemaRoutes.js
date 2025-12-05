const express = require('express');
const router = express.Router();
const CinemaController = require('../controllers/CinemaController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/cinemas - danh sách rạp phim
router.get('/', asyncHandler(CinemaController.getAllCinemas));

// GET /api/cinemas/:id/details - chi tiết rạp phim kèm phòng và suất chiếu
router.get('/:id/details', asyncHandler(CinemaController.getCinemaWithDetails));

// GET /api/cinemas/:id - chi tiết rạp phim
router.get('/:id', asyncHandler(CinemaController.getCinemaById));

// Admin routes (cần authentication + admin role)
// POST /api/cinemas - tạo rạp mới
router.post('/', authenticate, isAdmin, asyncHandler(CinemaController.createCinema));

// PUT /api/cinemas/:id - cập nhật rạp
router.put('/:id', authenticate, isAdmin, asyncHandler(CinemaController.updateCinema));

// DELETE /api/cinemas/:id - xóa rạp
router.delete('/:id', authenticate, isAdmin, asyncHandler(CinemaController.deleteCinema));

module.exports = router;

