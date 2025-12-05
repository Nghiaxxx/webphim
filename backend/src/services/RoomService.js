const Room = require('../models/Room');
const Cinema = require('../models/Cinema');
const { HTTP_STATUS } = require('../config/constants');

class RoomService {
  static async getAllRooms(filters = {}) {
    try {
      const rooms = await Room.findAll(filters);
      // Parse JSON layout_config for each room and get current showtimes
      const roomsWithData = await Promise.all(rooms.map(async (room) => {
        const parsedConfig = typeof room.layout_config === 'string' 
          ? JSON.parse(room.layout_config) 
          : room.layout_config;
        
        // Get current showtimes for this room
        let currentShowtimes = [];
        try {
          currentShowtimes = await Room.getCurrentShowtimes(room.id);
        } catch (err) {
          console.error(`Error fetching showtimes for room ${room.id}:`, err);
        }
        
        return {
          ...room,
          layout_config: parsedConfig,
          current_showtimes: currentShowtimes
        };
      }));
      
      return { success: true, data: roomsWithData };
    } catch (error) {
      throw error;
    }
  }

  static async getRoomById(id) {
    try {
      const room = await Room.findById(id);
      if (!room) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy phòng chiếu'
        };
      }
      // Parse JSON layout_config
      const roomWithParsedConfig = {
        ...room,
        layout_config: typeof room.layout_config === 'string' 
          ? JSON.parse(room.layout_config) 
          : room.layout_config
      };
      return { success: true, data: roomWithParsedConfig };
    } catch (error) {
      throw error;
    }
  }

  static async getRoomsByCinemaId(cinemaId) {
    try {
      const rooms = await Room.findByCinemaId(cinemaId);
      // Parse JSON layout_config for each room
      const roomsWithParsedConfig = rooms.map(room => ({
        ...room,
        layout_config: typeof room.layout_config === 'string' 
          ? JSON.parse(room.layout_config) 
          : room.layout_config
      }));
      return { success: true, data: roomsWithParsedConfig };
    } catch (error) {
      throw error;
    }
  }

  static async getRoomLayout(roomId) {
    try {
      const layout = await Room.getLayoutConfig(roomId);
      if (!layout) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy layout của phòng chiếu'
        };
      }
      return { success: true, data: layout };
    } catch (error) {
      throw error;
    }
  }

  static async createRoom(roomData) {
    try {
      // Validate cinema_id exists
      const cinema = await Cinema.findById(roomData.cinema_id);
      if (!cinema) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy rạp phim'
        };
      }

      // Validate required fields
      if (!roomData.name || !roomData.cinema_id) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Tên phòng và rạp phim là bắt buộc'
        };
      }

      const result = await Room.create(roomData);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateRoom(id, updateData) {
    try {
      // Check if room exists
      const room = await Room.findById(id);
      if (!room) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy phòng chiếu'
        };
      }

      // Validate cinema_id if provided
      if (updateData.cinema_id) {
        const cinema = await Cinema.findById(updateData.cinema_id);
        if (!cinema) {
          return {
            success: false,
            status: HTTP_STATUS.NOT_FOUND,
            message: 'Không tìm thấy rạp phim'
          };
        }
      }

      const result = await Room.update(id, updateData);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      // Get updated room
      const updatedRoom = await Room.findById(id);
      return {
        success: true,
        data: updatedRoom
      };
    } catch (error) {
      throw error;
    }
  }

  static async deleteRoom(id) {
    try {
      // Check if room exists
      const room = await Room.findById(id);
      if (!room) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy phòng chiếu'
        };
      }

      const result = await Room.delete(id);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa phòng chiếu'
        };
      }

      return {
        success: true,
        message: 'Xóa phòng chiếu thành công'
      };
    } catch (error) {
      // Check for foreign key constraint error
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return {
          success: false,
          status: HTTP_STATUS.CONFLICT,
          message: 'Không thể xóa phòng chiếu vì đang có suất chiếu sử dụng'
        };
      }
      throw error;
    }
  }
}

module.exports = RoomService;
