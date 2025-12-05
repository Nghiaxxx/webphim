const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/RoomController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/rooms - danh sách tất cả phòng chiếu
router.get('/', asyncHandler(RoomController.getAllRooms));

// GET /api/rooms/:id - chi tiết phòng chiếu
router.get('/:id', asyncHandler(RoomController.getRoomById));

// GET /api/rooms/:id/layout - lấy layout config của phòng
router.get('/:id/layout', asyncHandler(RoomController.getRoomLayout));

// GET /api/rooms/cinema/:cinemaId - danh sách phòng theo rạp
router.get('/cinema/:cinemaId', asyncHandler(RoomController.getRoomsByCinemaId));

// Admin routes (cần authentication + admin role)
// POST /api/rooms - tạo phòng mới
router.post('/', authenticate, isAdmin, asyncHandler(RoomController.createRoom));

// PUT /api/rooms/:id - cập nhật phòng
router.put('/:id', authenticate, isAdmin, asyncHandler(RoomController.updateRoom));

// DELETE /api/rooms/:id - xóa phòng
router.delete('/:id', authenticate, isAdmin, asyncHandler(RoomController.deleteRoom));

module.exports = router;
