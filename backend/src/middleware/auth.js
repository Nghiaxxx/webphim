const UserService = require('../services/UserService');
const User = require('../models/User');
const { HTTP_STATUS } = require('../config/constants');

// Middleware xác thực JWT token
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Token không được cung cấp. Vui lòng đăng nhập.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = UserService.verifyToken(token);
    
    if (!decoded) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Kiểm tra session trong database
    const session = await User.findSessionByToken(token);
    
    if (!session) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Session không tồn tại hoặc đã hết hạn'
      });
    }

    // Kiểm tra user status
    if (session.user_status !== 'active') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Tài khoản đã bị khóa hoặc vô hiệu hóa'
      });
    }

    // Lưu thông tin user vào request
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Lỗi xác thực'
    });
  }
};

// Middleware kiểm tra role (optional - cho admin routes sau này)
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          error: 'Vui lòng đăng nhập'
        });
      }

      const user = await User.findById(req.user.userId);
      
      if (!user || !roles.includes(user.role)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          error: 'Bạn không có quyền truy cập'
        });
      }

      next();
    } catch (error) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Lỗi kiểm tra quyền'
      });
    }
  };
};

// Middleware kiểm tra quyền admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Vui lòng đăng nhập'
      });
    }

    const user = await User.findById(req.user.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: 'Bạn không có quyền admin'
      });
    }

    next();
  } catch (error) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: 'Lỗi kiểm tra quyền admin'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  isAdmin
};

