const express = require('express');
const router = express.Router();
const RevenueController = require('../controllers/RevenueController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/admin/revenue - thống kê doanh thu (admin only)
router.get('/', authenticate, isAdmin, asyncHandler(RevenueController.getRevenue));

module.exports = router;

