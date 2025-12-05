const db = require('../lib/db');

class User {
  // Tìm user theo email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      db.query(sql, [email], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Tìm user theo ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, email, phone, full_name, date_of_birth, gender, avatar_url, address, loyalty_points, email_verified, phone_verified, status, role, created_at, updated_at, last_login FROM users WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Tìm user theo phone
  static findByPhone(phone) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE phone = ?';
      db.query(sql, [phone], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Tạo user mới
  static create(userData) {
    return new Promise((resolve, reject) => {
      const {
        email,
        phone,
        password_hash,
        full_name,
        date_of_birth,
        gender,
        avatar_url,
        address
      } = userData;

      const sql = `
        INSERT INTO users 
        (email, phone, password_hash, full_name, date_of_birth, gender, avatar_url, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        email,
        phone || null,
        password_hash,
        full_name,
        date_of_birth || null,
        gender || null,
        avatar_url || null,
        address || null
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          email,
          full_name
        });
      });
    });
  }

  // Cập nhật thông tin user
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'full_name', 'date_of_birth', 'gender', 'avatar_url', 
        'address', 'phone', 'email_verified', 'phone_verified'
      ];
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return resolve(null);
      }

      values.push(id);
      const sql = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Cập nhật password
  static updatePassword(id, password_hash) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      db.query(sql, [password_hash, id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Cập nhật last_login
  static updateLastLogin(id) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Cập nhật loyalty_points
  static updateLoyaltyPoints(id, points) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?';
      db.query(sql, [points, id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Lưu session (JWT token)
  static saveSession(sessionData) {
    return new Promise((resolve, reject) => {
      const {
        user_id,
        token,
        refresh_token,
        device_info,
        ip_address,
        expires_at
      } = sessionData;

      const sql = `
        INSERT INTO user_sessions 
        (user_id, token, refresh_token, device_info, ip_address, expires_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.query(sql, [user_id, token, refresh_token, device_info, ip_address, expires_at], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }

  // Xóa session (logout)
  static deleteSession(token) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM user_sessions WHERE token = ?';
      db.query(sql, [token], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Tìm session theo token
  static findSessionByToken(token) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT s.*, u.id as user_id, u.email, u.full_name, u.role, u.status as user_status
        FROM user_sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > NOW()
      `;
      db.query(sql, [token], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Get all users (for admin - không trả về password_hash)
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          id, email, phone, full_name, date_of_birth, gender, avatar_url, address,
          loyalty_points, email_verified, phone_verified, status, role,
          created_at, updated_at, last_login
        FROM users
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.role) {
        sql += ' AND role = ?';
        params.push(filters.role);
      }
      
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.search) {
        sql += ' AND (email LIKE ? OR full_name LIKE ? OR phone LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY created_at DESC';
      
      // Limit results if specified
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(parseInt(filters.limit));
        
        if (filters.offset) {
          sql += ' OFFSET ?';
          params.push(parseInt(filters.offset));
        }
      }

      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Update user
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'email',
        'phone',
        'full_name',
        'date_of_birth',
        'gender',
        'avatar_url',
        'address',
        'loyalty_points',
        'email_verified',
        'phone_verified',
        'status',
        'role'
      ];
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length === 0) {
        return resolve(null);
      }

      values.push(id);
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete user (soft delete: set status = 'inactive')
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE users SET status = 'inactive' WHERE id = ?";
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = User;

