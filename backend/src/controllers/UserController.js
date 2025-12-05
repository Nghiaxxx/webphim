const UserService = require('../services/UserService');
const { HTTP_STATUS } = require('../config/constants');

class UserController {
  // Đăng ký
  static async register(req, res, next) {
    try {
      const userData = {
        ...req.body,
        device_info: req.headers['user-agent'],
        ip_address: req.ip || req.connection.remoteAddress
      };

      const result = await UserService.register(userData);

      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }

      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Đăng nhập
  static async login(req, res, next) {
    try {
      const credentials = {
        ...req.body,
        device_info: req.headers['user-agent'],
        ip_address: req.ip || req.connection.remoteAddress
      };

      const result = await UserService.login(credentials);

      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }

      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Lấy profile (cần authentication)
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const result = await UserService.getProfile(userId);

      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }

      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Cập nhật profile (cần authentication)
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.userId;
      const result = await UserService.updateProfile(userId, req.body);

      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }

      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Đổi password (cần authentication)
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.userId;
      const { old_password, new_password } = req.body;

      const result = await UserService.changePassword(userId, old_password, new_password);

      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }

      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }

  // Đăng xuất (cần authentication)
  static async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Token không hợp lệ' });
      }

      const result = await UserService.logout(token);

      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }

      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }

  // Get all users (admin only)
  static async getAllUsers(req, res, next) {
    try {
      const filters = {
        role: req.query.role,
        status: req.query.status,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset
      };
      
      const result = await UserService.getAllUsers(filters);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Get user by ID (admin only)
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await UserService.getUserById(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Update user (admin only)
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await UserService.updateUser(id, updateData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  // Delete user (admin only)
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const currentUserId = req.user.userId;
      const result = await UserService.deleteUser(id, currentUserId);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;

