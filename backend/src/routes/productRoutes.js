const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/products - danh sách sản phẩm (có thể filter theo type)
router.get('/', asyncHandler(ProductController.getAllProducts));

// GET /api/products/:id - chi tiết sản phẩm
router.get('/:id', asyncHandler(ProductController.getProductById));

// Admin routes (cần authentication + admin role)
// POST /api/products - tạo sản phẩm mới
router.post('/', authenticate, isAdmin, asyncHandler(ProductController.createProduct));

// PUT /api/products/:id - cập nhật sản phẩm
router.put('/:id', authenticate, isAdmin, asyncHandler(ProductController.updateProduct));

// DELETE /api/products/:id - xóa sản phẩm (soft delete)
router.delete('/:id', authenticate, isAdmin, asyncHandler(ProductController.deleteProduct));

module.exports = router;

