const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: ERROR_MESSAGES.DUPLICATE_ENTRY,
      message: err.message || 'Dữ liệu đã tồn tại'
    });
  }

  // MySQL connection error
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Lỗi kết nối database',
      message: 'Không thể kết nối đến database'
    });
  }

  // Default error
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: err.message || ERROR_MESSAGES.SERVER_ERROR,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async handler wrapper to catch errors in async routes
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};

