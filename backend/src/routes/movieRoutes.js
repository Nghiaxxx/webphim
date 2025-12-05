const express = require('express');
const router = express.Router();
const MovieController = require('../controllers/MovieController');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
// const { isAdmin } = require('../middleware/auth'); // Will add later

// GET /api/movies - danh sách phim (có thể filter theo status)
router.get('/', asyncHandler(MovieController.getAllMovies));

// GET /api/movies/:id - chi tiết phim
router.get('/:id', asyncHandler(MovieController.getMovieById));

// POST /api/movies - tạo phim mới (cần authentication)
router.post('/', authenticate, asyncHandler(MovieController.createMovie));

// PUT /api/movies/:id - cập nhật phim (cần authentication)
router.put('/:id', authenticate, asyncHandler(MovieController.updateMovie));

// DELETE /api/movies/:id - xóa phim (cần authentication)
router.delete('/:id', authenticate, asyncHandler(MovieController.deleteMovie));

module.exports = router;

