const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

// Validation middleware
const validateBooking = (req, res, next) => {
  const { showtimeId, customerName, customerPhone, seats } = req.body;

  if (!showtimeId) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_INPUT,
      message: 'Thiếu showtimeId'
    });
  }

  if (!customerName || customerName.trim().length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_INPUT,
      message: 'Thiếu tên khách hàng'
    });
  }

  if (!customerPhone || customerPhone.trim().length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_INPUT,
      message: 'Thiếu số điện thoại'
    });
  }

  if (!Array.isArray(seats) || seats.length === 0) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: ERROR_MESSAGES.INVALID_INPUT,
      message: 'Thiếu thông tin ghế ngồi'
    });
  }

  // Validate seat format (row is STRING, col is NUMBER)
  for (const seat of seats) {
    if (!seat.row || typeof seat.row !== 'string' || seat.row.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_INPUT,
        message: 'Hàng ghế (row) không hợp lệ - phải là chữ cái (A, B, C...)'
      });
    }
    
    if (typeof seat.col !== 'number' || seat.col < 1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_INPUT,
        message: 'Số ghế (col) không hợp lệ - phải là số > 0'
      });
    }
  }

  next();
};

module.exports = {
  validateBooking
};

