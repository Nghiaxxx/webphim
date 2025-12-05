const PromotionService = require('../services/PromotionService');
const { HTTP_STATUS } = require('../config/constants');

class PromotionController {
  static async getAllPromotions(req, res, next) {
    try {
      console.log('📥 Getting all promotions...');
      const filters = {
        search: req.query.search
      };
      const result = await PromotionService.getAllPromotions(filters);
      // result should be an array, return it directly
      const promotions = Array.isArray(result) ? result : (result?.data || []);
      console.log(`✅ Returning ${promotions.length} promotions`);
      res.status(HTTP_STATUS.OK).json(promotions);
    } catch (error) {
      console.error('❌ Error in getAllPromotions controller:', error);
      console.error('Promotions API error details:', {
        message: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      });
      // Return empty array instead of error to prevent frontend issues
      res.status(HTTP_STATUS.OK).json([]);
    }
  }

  static async getPromotionBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const result = await PromotionService.getPromotionBySlug(slug);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async createPromotion(req, res, next) {
    try {
      const result = await PromotionService.createPromotion(req.body);
      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async updatePromotion(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PromotionService.updatePromotion(id, req.body);
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async deletePromotion(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PromotionService.deletePromotion(id);
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PromotionController;

