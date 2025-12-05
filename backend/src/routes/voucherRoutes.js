const express = require('express');
const router = express.Router();
const VoucherController = require('../controllers/VoucherController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Public routes
// GET /api/vouchers - danh sách vouchers (có thể filter theo status, active_only)
router.get('/', asyncHandler(VoucherController.getAllVouchers));

// GET /api/vouchers/:code - chi tiết voucher theo code
router.get('/:code', asyncHandler(VoucherController.getVoucherByCode));

// Protected routes (cần authentication)
// GET /api/vouchers/user/list - vouchers của user hiện tại
router.get('/user/list', authenticate, asyncHandler(VoucherController.getUserVouchers));

// POST /api/vouchers/apply - áp dụng voucher vào booking
router.post('/apply', authenticate, asyncHandler(VoucherController.applyVoucher));

// Admin routes (cần authentication + admin role)
// POST /api/vouchers - tạo voucher mới
router.post('/', authenticate, isAdmin, asyncHandler(VoucherController.createVoucher));

// PUT /api/vouchers/:id - cập nhật voucher
router.put('/:id', authenticate, isAdmin, asyncHandler(VoucherController.updateVoucher));

// DELETE /api/vouchers/:id - xóa voucher
router.delete('/:id', authenticate, isAdmin, asyncHandler(VoucherController.deleteVoucher));

module.exports = router;

