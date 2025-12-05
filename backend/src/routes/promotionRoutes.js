const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/PromotionController');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');

// GET /api/promotions - danh sách khuyến mãi đang hoạt động
router.get('/', asyncHandler(PromotionController.getAllPromotions));

// GET /api/promotions/:slug - chi tiết khuyến mãi
router.get('/:slug', asyncHandler(PromotionController.getPromotionBySlug));

// POST /api/promotions - tạo khuyến mãi mới
router.post('/', authenticate, asyncHandler(PromotionController.createPromotion));

// PUT /api/promotions/:id - cập nhật khuyến mãi
router.put('/:id', authenticate, asyncHandler(PromotionController.updatePromotion));

// DELETE /api/promotions/:id - xóa khuyến mãi
router.delete('/:id', authenticate, asyncHandler(PromotionController.deletePromotion));

module.exports = router;

