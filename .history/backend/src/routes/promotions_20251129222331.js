// backend/src/routes/promotions.js

const express = require('express');
const db = require('../lib/db'); // Dùng lại module kết nối DB

const router = express.Router();

// 1. GET /api/promotions - Danh sách Khuyến mãi đang hoạt động (cho Slideshow)
router.get('/', (req, res) => {
    // 💥 CHỈ LẤY CÁC TRƯỜNG CẦN THIẾT cho Slideshow: id, title, slug, image_url
    const sql = `
        SELECT id, title, slug, image_url 
        FROM promotions 
        WHERE is_active = TRUE AND end_date >= CURDATE()
        ORDER BY created_at DESC;
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy danh sách khuyến mãi:", err);
            return res.status(500).json({ error: 'Lỗi server khi truy vấn khuyến mãi' });
        }
        res.json(results);
    });
});

// 2. GET /api/promotions/:slug - Chi tiết Khuyến mãi (cho Trang riêng)
router.get('/:slug', (req, res) => {
    const slug = req.params.slug;
    
    // 💥 LẤY TẤT CẢ các trường (bao gồm JSON)
    const sql = `
        SELECT 
            id, title, slug, image_url, description, 
            conditions_json, notes_json 
        FROM promotions 
        WHERE slug = ? AND is_active = TRUE AND end_date >= CURDATE();
    `;
    
    db.query(sql, [slug], (err, results) => {
        if (err) {
            console.error("Lỗi khi lấy chi tiết khuyến mãi:", err);
            return res.status(500).json({ error: 'Lỗi server' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy chương trình khuyến mãi' });
        }
        
        const promotion = results[0];
        
        // ⚠️ Xử lý JSON: MySQL trả về JSON dưới dạng chuỗi. Cần parse thành đối tượng/mảng trong JS.
        try {
            if (promotion.conditions_json) {
                promotion.conditions = JSON.parse(promotion.conditions_json);
                delete promotion.conditions_json;
            }
            if (promotion.notes_json) {
                promotion.notes = JSON.parse(promotion.notes_json);
                delete promotion.notes_json;
            }
        } catch (parseError) {
            console.error("Lỗi parse JSON khuyến mãi:", parseError);
            // Có thể bỏ qua lỗi này và để Frontend xử lý mảng rỗng nếu JSON bị lỗi.
        }

        res.json(promotion);
    });
});

module.exports = router;