const Showtime = require('../models/Showtime');
const { HTTP_STATUS } = require('../config/constants');

class ShowtimeService {
  static async getAllShowtimes(filters) {
    try {
      // Support both old format (movieId, roomId as separate params) and new format (filters object)
      const filterObj = typeof filters === 'object' 
        ? filters 
        : { movieId: filters, roomId: arguments[1] };
      const showtimes = await Showtime.findAll(filterObj);
      return { success: true, data: showtimes };
    } catch (error) {
      throw error;
    }
  }

  static async createShowtime(showtimeData) {
    try {
      const showtime = await Showtime.create(showtimeData);
      return { success: true, data: showtime };
    } catch (error) {
      throw error;
    }
  }

  static async createMultipleShowtimes(showtimesData) {
    try {
      if (!Array.isArray(showtimesData) || showtimesData.length === 0) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Danh sách suất chiếu không hợp lệ'
        };
      }

      // Validate all showtimes
      for (const st of showtimesData) {
        if (!st.movie_id || !st.start_time || !st.room_id) {
          return {
            success: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: 'Mỗi suất chiếu cần có phim, thời gian bắt đầu và phòng chiếu'
          };
        }
      }

      const createdShowtimes = await Showtime.createMultiple(showtimesData);
      return { 
        success: true, 
        data: createdShowtimes,
        message: `Đã tạo thành công ${createdShowtimes.length} suất chiếu`
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateShowtime(id, updateData) {
    try {
      const exists = await Showtime.findById(id);
      if (!exists) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy suất chiếu'
        };
      }

      const updated = await Showtime.update(id, updateData);
      if (!updated) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      const showtime = await Showtime.findById(id);
      return { success: true, data: showtime };
    } catch (error) {
      throw error;
    }
  }

  static async deleteShowtime(id) {
    try {
      const exists = await Showtime.findById(id);
      if (!exists) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy suất chiếu'
        };
      }

      const deleted = await Showtime.delete(id);
      if (!deleted) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa suất chiếu'
        };
      }

      return { success: true, message: 'Xóa suất chiếu thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ShowtimeService;

