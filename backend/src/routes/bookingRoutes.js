const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/BookingController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateBooking } = require('../middleware/validator');

// Admin routes (cần authentication + admin role)
// GET /api/bookings - danh sách tất cả đặt vé (với filters)
router.get('/', authenticate, isAdmin, asyncHandler(BookingController.getAllBookings));

// GET /api/bookings/:id - chi tiết đặt vé
router.get('/:id', authenticate, isAdmin, asyncHandler(BookingController.getBookingById));

// PUT /api/bookings/:id - cập nhật đặt vé
router.put('/:id', authenticate, isAdmin, asyncHandler(BookingController.updateBooking));

// DELETE /api/bookings/:id - xóa đặt vé
router.delete('/:id', authenticate, isAdmin, asyncHandler(BookingController.deleteBooking));

// Public routes
// GET /api/bookings/:showtimeId/seats - ghế đã đặt cho 1 suất chiếu
router.get('/:showtimeId/seats', asyncHandler(BookingController.getBookedSeats));

// POST /api/bookings - tạo đơn đặt vé
router.post('/', validateBooking, asyncHandler(BookingController.createBooking));

module.exports = router;

