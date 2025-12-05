const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const BookingController = require('../controllers/BookingController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes (không cần authentication)
router.post('/register', asyncHandler(UserController.register));
router.post('/login', asyncHandler(UserController.login));

// Protected routes (cần authentication)
router.get('/profile', authenticate, asyncHandler(UserController.getProfile));
router.put('/profile', authenticate, asyncHandler(UserController.updateProfile));
router.put('/change-password', authenticate, asyncHandler(UserController.changePassword));
router.post('/logout', authenticate, asyncHandler(UserController.logout));
router.get('/bookings', authenticate, asyncHandler(BookingController.getUserBookings));

// Admin routes (cần authentication + admin role)
// GET /api/users - danh sách tất cả users (với filters)
router.get('/', authenticate, isAdmin, asyncHandler(UserController.getAllUsers));

// GET /api/users/:id - chi tiết user
router.get('/:id', authenticate, isAdmin, asyncHandler(UserController.getUserById));

// PUT /api/users/:id - cập nhật user
router.put('/:id', authenticate, isAdmin, asyncHandler(UserController.updateUser));

// DELETE /api/users/:id - xóa user (soft delete)
router.delete('/:id', authenticate, isAdmin, asyncHandler(UserController.deleteUser));

module.exports = router;

