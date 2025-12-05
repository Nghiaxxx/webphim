const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { HTTP_STATUS } = require('../config/constants');

class UserService {
  // Đăng ký user mới
  static async register(userData) {
    try {
      const { email, password, full_name, phone, date_of_birth, gender, address } = userData;

      // Validation
      if (!email || !password || !full_name) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Email, password và tên đầy đủ là bắt buộc'
        };
      }

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return {
          success: false,
          status: HTTP_STATUS.CONFLICT,
          message: 'Email đã được sử dụng'
        };
      }

      // Kiểm tra phone nếu có
      if (phone) {
        const existingPhone = await User.findByPhone(phone);
        if (existingPhone) {
          return {
            success: false,
            status: HTTP_STATUS.CONFLICT,
            message: 'Số điện thoại đã được sử dụng'
          };
        }
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Tạo user
      const newUser = await User.create({
        email,
        phone: phone || null,
        password_hash,
        full_name,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        address: address || null
      });

      // Tạo JWT token
      const token = this.generateToken(newUser.id, newUser.email);
      const refreshToken = this.generateRefreshToken(newUser.id);

      // Lưu session
      await User.saveSession({
        user_id: newUser.id,
        token,
        refresh_token: refreshToken,
        device_info: userData.device_info || null,
        ip_address: userData.ip_address || null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      return {
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.full_name
          },
          token,
          refresh_token: refreshToken
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Đăng nhập
  static async login(credentials) {
    try {
      const { email, password, device_info, ip_address } = credentials;

      if (!email || !password) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Email và password là bắt buộc'
        };
      }

      // Tìm user
      const user = await User.findByEmail(email);
      if (!user) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Email hoặc password không đúng'
        };
      }

      // Kiểm tra status
      if (user.status !== 'active') {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Tài khoản đã bị khóa hoặc vô hiệu hóa'
        };
      }

      // Kiểm tra password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Email hoặc password không đúng'
        };
      }

      // Cập nhật last_login
      await User.updateLastLogin(user.id);

      // Tạo JWT token
      const token = this.generateToken(user.id, user.email);
      const refreshToken = this.generateRefreshToken(user.id);

      // Lưu session
      await User.saveSession({
        user_id: user.id,
        token,
        refresh_token: refreshToken,
        device_info: device_info || null,
        ip_address: ip_address || null,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });

      // Trả về thông tin user (không có password)
      const { password_hash: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refresh_token: refreshToken
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy thông tin profile
  static async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy user'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật profile
  static async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy user'
        };
      }

      // Kiểm tra email/phone nếu có thay đổi
      if (updateData.email && updateData.email !== user.email) {
        const existingEmail = await User.findByEmail(updateData.email);
        if (existingEmail) {
          return {
            success: false,
            status: HTTP_STATUS.CONFLICT,
            message: 'Email đã được sử dụng'
          };
        }
      }

      if (updateData.phone && updateData.phone !== user.phone) {
        const existingPhone = await User.findByPhone(updateData.phone);
        if (existingPhone) {
          return {
            success: false,
            status: HTTP_STATUS.CONFLICT,
            message: 'Số điện thoại đã được sử dụng'
          };
        }
      }

      // Cập nhật
      const updated = await User.update(userId, updateData);
      
      if (!updated) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có thay đổi nào'
        };
      }

      // Lấy thông tin mới
      const updatedUser = await User.findById(userId);

      return {
        success: true,
        data: updatedUser
      };
    } catch (error) {
      throw error;
    }
  }

  // Đổi password
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      if (!oldPassword || !newPassword) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Mật khẩu cũ và mật khẩu mới là bắt buộc'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
        };
      }

      // Lấy user với password_hash
      const userInfo = await User.findById(userId);
      if (!userInfo) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy user'
        };
      }
      const user = await User.findByEmail(userInfo.email);
      
      // Kiểm tra password cũ
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Mật khẩu cũ không đúng'
        };
      }

      // Hash password mới
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);

      // Cập nhật
      await User.updatePassword(userId, password_hash);

      return {
        success: true,
        message: 'Đổi mật khẩu thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  // Đăng xuất
  static async logout(token) {
    try {
      await User.deleteSession(token);
      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    } catch (error) {
      throw error;
    }
  }

  // Tạo JWT token
  static generateToken(userId, email) {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    return jwt.sign(
      { userId, email },
      secret,
      { expiresIn: '7d' }
    );
  }

  // Tạo refresh token
  static generateRefreshToken(userId) {
    const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: '30d' }
    );
  }

  // Verify token
  static verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }

  // Get all users (for admin)
  static async getAllUsers(filters = {}) {
    try {
      const users = await User.findAll(filters);
      return {
        success: true,
        data: users
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID (for admin)
  static async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy người dùng'
        };
      }
      return {
        success: true,
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user (for admin)
  static async updateUser(id, updateData) {
    try {
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy người dùng'
        };
      }

      // Validate: không cho phép xóa chính mình
      // Note: req.user.userId sẽ được truyền từ controller

      // Validate: không cho phép thay đổi role của admin khác (nếu cần)
      // Note: Có thể thêm logic này nếu cần

      // Validate email uniqueness if email is being updated
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findByEmail(updateData.email);
        if (existingUser) {
          return {
            success: false,
            status: HTTP_STATUS.CONFLICT,
            message: 'Email đã được sử dụng'
          };
        }
      }

      // Validate phone uniqueness if phone is being updated
      if (updateData.phone && updateData.phone !== user.phone) {
        const existingUser = await User.findByPhone(updateData.phone);
        if (existingUser) {
          return {
            success: false,
            status: HTTP_STATUS.CONFLICT,
            message: 'Số điện thoại đã được sử dụng'
          };
        }
      }

      const result = await User.update(id, updateData);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      // Get updated user
      const updatedUser = await User.findById(id);
      return {
        success: true,
        data: updatedUser
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete user (for admin - soft delete)
  static async deleteUser(id, currentUserId) {
    try {
      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy người dùng'
        };
      }

      // Không cho phép xóa chính mình
      if (parseInt(id) === parseInt(currentUserId)) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa chính mình'
        };
      }

      // Không cho phép xóa admin khác (nếu cần)
      // if (user.role === 'admin') {
      //   return {
      //     success: false,
      //     status: HTTP_STATUS.FORBIDDEN,
      //     message: 'Không thể xóa tài khoản admin'
      //   };
      // }

      // Soft delete: set status = 'inactive'
      const result = await User.delete(id);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa người dùng'
        };
      }

      return {
        success: true,
        message: 'Xóa người dùng thành công'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserService;

