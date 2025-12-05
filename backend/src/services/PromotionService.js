const Promotion = require('../models/Promotion');
const { HTTP_STATUS } = require('../config/constants');

class PromotionService {
  static async getAllPromotions(filters = {}) {
    try {
      const promotions = await Promotion.findAll(filters);
      return { success: true, data: promotions };
    } catch (error) {
      throw error;
    }
  }

  static async getPromotionBySlug(slug) {
    try {
      const promotion = await Promotion.findBySlug(slug);
      if (!promotion) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy chương trình khuyến mãi'
        };
      }
      return { success: true, data: promotion };
    } catch (error) {
      throw error;
    }
  }

  static async createPromotion(promotionData) {
    try {
      const promotion = await Promotion.create(promotionData);
      return { success: true, data: promotion };
    } catch (error) {
      throw error;
    }
  }

  static async updatePromotion(id, updateData) {
    try {
      const exists = await Promotion.findBySlug(`promo-${id}`);
      if (!exists) {
        const sql = 'SELECT * FROM promotions WHERE id = ?';
        const db = require('../lib/db');
        const result = await new Promise((resolve, reject) => {
          db.query(sql, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0] || null);
          });
        });
        if (!result) {
          return {
            success: false,
            status: HTTP_STATUS.NOT_FOUND,
            message: 'Không tìm thấy khuyến mãi'
          };
        }
      }

      const updated = await Promotion.update(id, updateData);
      if (!updated) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      const promotion = await Promotion.findBySlug(`promo-${id}`);
      return { success: true, data: promotion };
    } catch (error) {
      throw error;
    }
  }

  static async deletePromotion(id) {
    try {
      const sql = 'SELECT * FROM promotions WHERE id = ?';
      const db = require('../lib/db');
      const exists = await new Promise((resolve, reject) => {
        db.query(sql, [id], (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        });
      });

      if (!exists) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy khuyến mãi'
        };
      }

      const deleted = await Promotion.delete(id);
      if (!deleted) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa khuyến mãi'
        };
      }

      return { success: true, message: 'Xóa khuyến mãi thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PromotionService;

