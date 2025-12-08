const SeatLock = require('../models/SeatLock');
const { HTTP_STATUS } = require('../config/constants');

class SeatLockService {
  static async lockSeats(showtimeId, seats, sessionId) {
    try {
      const result = await SeatLock.lockSeats(showtimeId, seats, sessionId, 300); // 5 phút
      
      if (result.failedSeats.length > 0) {
        return {
          success: false,
          status: HTTP_STATUS.CONFLICT,
          message: 'Một số ghế không thể lock',
          data: {
            lockedSeats: result.lockedSeats,
            failedSeats: result.failedSeats
          }
        };
      }

      return {
        success: true,
        data: {
          lockedSeats: result.lockedSeats
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async unlockSeats(showtimeId, seats, sessionId) {
    try {
      await SeatLock.unlockSeats(showtimeId, seats, sessionId);
      return {
        success: true,
        message: 'Unlock ghế thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  static async getLockedSeats(showtimeId) {
    try {
      const locks = await SeatLock.getLockedSeats(showtimeId);
      return {
        success: true,
        data: locks
      };
    } catch (error) {
      throw error;
    }
  }

  static async clearSessionLocks(sessionId) {
    try {
      await SeatLock.clearSessionLocks(sessionId);
      return {
        success: true,
        message: 'Xóa tất cả lock thành công'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SeatLockService;

