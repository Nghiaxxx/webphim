const VoucherService = require('../services/VoucherService');
const { HTTP_STATUS } = require('../config/constants');

class VoucherController {
  // Get all vouchers (public or admin)
  static async getAllVouchers(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        active_only: req.query.active_only === 'true',
        search: req.query.search
      };
      
      const result = await VoucherService.getAllVouchers(filters);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Get voucher by code
  static async getVoucherByCode(req, res, next) {
    try {
      const { code } = req.params;
      const result = await VoucherService.getVoucherByCode(code);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Get user vouchers
  static async getUserVouchers(req, res, next) {
    try {
      const userId = req.user.userId;
      const result = await VoucherService.getUserVouchers(userId);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Apply voucher
  static async applyVoucher(req, res, next) {
    try {
      const { code } = req.body;
      const bookingData = req.body.booking || req.body;
      const userId = req.user ? req.user.userId : null;
      
      if (!code) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          error: 'Mã voucher là bắt buộc' 
        });
      }

      const result = await VoucherService.applyVoucher(code, bookingData, userId);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Create voucher (admin)
  static async createVoucher(req, res, next) {
    try {
      const voucherData = req.body;
      const result = await VoucherService.createVoucher(voucherData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Update voucher (admin)
  static async updateVoucher(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await VoucherService.updateVoucher(id, updateData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Delete voucher (admin)
  static async deleteVoucher(req, res, next) {
    try {
      const { id } = req.params;
      const result = await VoucherService.deleteVoucher(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VoucherController;

