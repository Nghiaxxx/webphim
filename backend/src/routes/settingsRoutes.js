const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/SettingsController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/admin/settings - Lấy cài đặt hệ thống (admin only)
router.get('/', authenticate, isAdmin, asyncHandler(SettingsController.getSettings));

// PUT /api/admin/settings - Cập nhật cài đặt hệ thống (admin only)
router.put('/', authenticate, isAdmin, asyncHandler(SettingsController.updateSettings));

module.exports = router;

