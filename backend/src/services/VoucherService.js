const Voucher = require('../models/Voucher');
const UserVoucher = require('../models/UserVoucher');
const { HTTP_STATUS } = require('../config/constants');

class VoucherService {
  // Get all vouchers
  static async getAllVouchers(filters = {}) {
    try {
      const vouchers = await Voucher.findAll(filters);
      
      // Parse JSON fields
      const formattedVouchers = vouchers.map(voucher => ({
        ...voucher,
        movie_ids: voucher.movie_ids ? 
          (typeof voucher.movie_ids === 'string' ? JSON.parse(voucher.movie_ids) : voucher.movie_ids) 
          : null,
        cinema_ids: voucher.cinema_ids ? 
          (typeof voucher.cinema_ids === 'string' ? JSON.parse(voucher.cinema_ids) : voucher.cinema_ids) 
          : null,
        discount_value: parseFloat(voucher.discount_value) || 0,
        max_discount: voucher.max_discount ? parseFloat(voucher.max_discount) : null,
        min_order_amount: parseFloat(voucher.min_order_amount) || 0
      }));

      return {
        success: true,
        data: formattedVouchers
      };
    } catch (error) {
      throw error;
    }
  }

  // Get voucher by code
  static async getVoucherByCode(code) {
    try {
      const voucher = await Voucher.findByCode(code);
      
      if (!voucher) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy voucher'
        };
      }

      // Parse JSON fields
      const formattedVoucher = {
        ...voucher,
        movie_ids: voucher.movie_ids ? 
          (typeof voucher.movie_ids === 'string' ? JSON.parse(voucher.movie_ids) : voucher.movie_ids) 
          : null,
        cinema_ids: voucher.cinema_ids ? 
          (typeof voucher.cinema_ids === 'string' ? JSON.parse(voucher.cinema_ids) : voucher.cinema_ids) 
          : null,
        discount_value: parseFloat(voucher.discount_value) || 0,
        max_discount: voucher.max_discount ? parseFloat(voucher.max_discount) : null,
        min_order_amount: parseFloat(voucher.min_order_amount) || 0
      };

      return {
        success: true,
        data: formattedVoucher
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user vouchers
  static async getUserVouchers(userId) {
    try {
      const userVouchers = await UserVoucher.findByUserId(userId, { available_only: true });
      
      return {
        success: true,
        data: userVouchers
      };
    } catch (error) {
      throw error;
    }
  }

  // Create voucher (admin)
  static async createVoucher(voucherData) {
    try {
      // Validate required fields
      if (!voucherData.code || !voucherData.name || !voucherData.discount_type || !voucherData.discount_value) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Code, name, discount_type và discount_value là bắt buộc'
        };
      }

      // Check if code already exists
      const existingVoucher = await Voucher.findByCode(voucherData.code);
      if (existingVoucher) {
        return {
          success: false,
          status: HTTP_STATUS.CONFLICT,
          message: 'Mã voucher đã tồn tại'
        };
      }

      // Validate discount_type
      if (!['fixed', 'percentage'].includes(voucherData.discount_type)) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'discount_type phải là "fixed" hoặc "percentage"'
        };
      }

      // Validate dates
      if (voucherData.start_date && voucherData.end_date) {
        if (new Date(voucherData.start_date) >= new Date(voucherData.end_date)) {
          return {
            success: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Ngày kết thúc phải sau ngày bắt đầu'
          };
        }
      }

      const result = await Voucher.create(voucherData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw error;
    }
  }

  // Update voucher (admin)
  static async updateVoucher(id, updateData) {
    try {
      // Check if voucher exists
      const voucher = await Voucher.findById(id);
      if (!voucher) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy voucher'
        };
      }

      // Validate discount_type if provided
      if (updateData.discount_type && !['fixed', 'percentage'].includes(updateData.discount_type)) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'discount_type phải là "fixed" hoặc "percentage"'
        };
      }

      // Validate dates if provided
      const startDate = updateData.start_date || voucher.start_date;
      const endDate = updateData.end_date || voucher.end_date;
      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Ngày kết thúc phải sau ngày bắt đầu'
        };
      }

      const result = await Voucher.update(id, updateData);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      // Get updated voucher
      const updatedVoucher = await Voucher.findById(id);
      return {
        success: true,
        data: updatedVoucher
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete voucher (admin)
  static async deleteVoucher(id) {
    try {
      // Check if voucher exists
      const voucher = await Voucher.findById(id);
      if (!voucher) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy voucher'
        };
      }

      const result = await Voucher.delete(id);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa voucher'
        };
      }

      return {
        success: true,
        message: 'Xóa voucher thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  // Apply voucher to booking
  static async applyVoucher(code, bookingData, userId = null) {
    try {
      // Get voucher by code
      const voucher = await Voucher.findByCode(code);
      if (!voucher) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Mã voucher không tồn tại'
        };
      }

      // Check voucher status
      if (voucher.status !== 'active') {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Voucher không còn hoạt động'
        };
      }

      // Check voucher dates
      const now = new Date();
      if (new Date(voucher.start_date) > now || new Date(voucher.end_date) < now) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Voucher chưa có hiệu lực hoặc đã hết hạn'
        };
      }

      // Check total quantity
      if (voucher.total_quantity !== null && voucher.used_count >= voucher.total_quantity) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Voucher đã hết số lượng'
        };
      }

      // Check min_order_amount
      const orderAmount = parseFloat(bookingData.total_price || bookingData.original_price || 0);
      if (orderAmount < parseFloat(voucher.min_order_amount)) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: `Đơn hàng phải có giá trị tối thiểu ${voucher.min_order_amount.toLocaleString('vi-VN')} VNĐ`
        };
      }

      // Check movie restriction
      if (voucher.movie_ids) {
        const movieIds = typeof voucher.movie_ids === 'string' 
          ? JSON.parse(voucher.movie_ids) 
          : voucher.movie_ids;
        if (bookingData.movie_id && !movieIds.includes(parseInt(bookingData.movie_id))) {
          return {
            success: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Voucher không áp dụng cho phim này'
          };
        }
      }

      // Check cinema restriction
      if (voucher.cinema_ids) {
        const cinemaIds = typeof voucher.cinema_ids === 'string' 
          ? JSON.parse(voucher.cinema_ids) 
          : voucher.cinema_ids;
        if (bookingData.cinema_id && !cinemaIds.includes(parseInt(bookingData.cinema_id))) {
          return {
            success: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Voucher không áp dụng cho rạp này'
          };
        }
      }

      // Check max_usage_per_user if user is logged in
      if (userId) {
        const usageCount = await UserVoucher.countUsageByUser(userId, voucher.id);
        if (usageCount >= voucher.max_usage_per_user) {
          return {
            success: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Bạn đã sử dụng hết số lần được phép sử dụng voucher này'
          };
        }
      }

      // Calculate discount
      let discountAmount = 0;
      if (voucher.discount_type === 'fixed') {
        discountAmount = parseFloat(voucher.discount_value);
      } else if (voucher.discount_type === 'percentage') {
        discountAmount = (orderAmount * parseFloat(voucher.discount_value)) / 100;
        if (voucher.max_discount && discountAmount > parseFloat(voucher.max_discount)) {
          discountAmount = parseFloat(voucher.max_discount);
        }
      }

      const finalPrice = Math.max(0, orderAmount - discountAmount);

      return {
        success: true,
        data: {
          voucher_id: voucher.id,
          voucher_code: voucher.code,
          voucher_name: voucher.name,
          discount_type: voucher.discount_type,
          discount_value: parseFloat(voucher.discount_value),
          discount_amount: discountAmount,
          original_price: orderAmount,
          final_price: finalPrice
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = VoucherService;

