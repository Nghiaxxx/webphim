const Cinema = require('../models/Cinema');
const { HTTP_STATUS } = require('../config/constants');

class CinemaService {
  static async getAllCinemas(filters = {}) {
    try {
      const cinemas = await Cinema.findAll(filters);
      return { success: true, data: cinemas };
    } catch (error) {
      throw error;
    }
  }

  static async getCinemaById(id) {
    try {
      const cinema = await Cinema.findById(id);
      if (!cinema) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy rạp phim'
        };
      }
      return { success: true, data: cinema };
    } catch (error) {
      throw error;
    }
  }

  static async createCinema(cinemaData) {
    try {
      // Validate required fields
      if (!cinemaData.name) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Tên rạp phim là bắt buộc'
        };
      }

      const result = await Cinema.create(cinemaData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      // Check for duplicate entry error
      if (error.code === 'ER_DUP_ENTRY') {
        return {
          success: false,
          status: HTTP_STATUS.CONFLICT,
          message: 'Tên rạp phim đã tồn tại'
        };
      }
      throw error;
    }
  }

  static async updateCinema(id, updateData) {
    try {
      // Check if cinema exists
      const cinema = await Cinema.findById(id);
      if (!cinema) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy rạp phim'
        };
      }

      const result = await Cinema.update(id, updateData);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      // Get updated cinema
      const updatedCinema = await Cinema.findById(id);
      return {
        success: true,
        data: updatedCinema
      };
    } catch (error) {
      throw error;
    }
  }

  static async deleteCinema(id) {
    try {
      // Check if cinema exists
      const cinema = await Cinema.findById(id);
      if (!cinema) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy rạp phim'
        };
      }

      const result = await Cinema.delete(id);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa rạp phim'
        };
      }

      return {
        success: true,
        message: 'Xóa rạp phim thành công'
      };
    } catch (error) {
      // Check for foreign key constraint error
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return {
          success: false,
          status: HTTP_STATUS.CONFLICT,
          message: 'Không thể xóa rạp phim vì đang có phòng chiếu hoặc suất chiếu sử dụng'
        };
      }
      throw error;
    }
  }

  static async getCinemaWithDetails(id) {
    try {
      const cinema = await Cinema.findByIdWithDetails(id);
      if (!cinema) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy rạp phim'
        };
      }
      return { success: true, data: cinema };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CinemaService;

