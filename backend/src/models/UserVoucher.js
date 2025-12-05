const db = require('../lib/db');

class UserVoucher {
  // Get user vouchers by user_id
  static findByUserId(userId, filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          uv.id,
          uv.user_id,
          uv.voucher_id,
          uv.status,
          uv.used_at,
          uv.booking_id,
          uv.expires_at,
          uv.created_at,
          v.code AS voucher_code,
          v.name AS voucher_name,
          v.description AS voucher_description,
          v.discount_type,
          v.discount_value,
          v.max_discount,
          v.min_order_amount,
          v.start_date AS voucher_start_date,
          v.end_date AS voucher_end_date
        FROM user_vouchers uv
        JOIN vouchers v ON uv.voucher_id = v.id
        WHERE uv.user_id = ?
      `;
      
      const params = [userId];
      
      // Apply filters
      if (filters.status) {
        sql += ' AND uv.status = ?';
        params.push(filters.status);
      }
      
      if (filters.available_only) {
        sql += ' AND uv.status = "available" AND (uv.expires_at IS NULL OR uv.expires_at > NOW())';
      }

      sql += ' ORDER BY uv.created_at DESC';

      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Get user voucher by voucher_id
  static findByVoucherId(userId, voucherId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT uv.*, v.code, v.name, v.discount_type, v.discount_value
        FROM user_vouchers uv
        JOIN vouchers v ON uv.voucher_id = v.id
        WHERE uv.user_id = ? AND uv.voucher_id = ? AND uv.status = 'available'
      `;
      db.query(sql, [userId, voucherId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Get user voucher by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM user_vouchers WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Create user voucher
  static create(userVoucherData) {
    return new Promise((resolve, reject) => {
      const {
        user_id,
        voucher_id,
        expires_at,
        status
      } = userVoucherData;

      const sql = `
        INSERT INTO user_vouchers (user_id, voucher_id, expires_at, status)
        VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        user_id,
        voucher_id,
        expires_at || null,
        status || 'available'
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...userVoucherData });
      });
    });
  }

  // Update user voucher
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['status', 'used_at', 'booking_id', 'expires_at'];
      
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
      const sql = `UPDATE user_vouchers SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Mark voucher as used
  static markAsUsed(id, bookingId) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE user_vouchers 
        SET status = 'used', used_at = NOW(), booking_id = ?
        WHERE id = ?
      `;
      db.query(sql, [bookingId, id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Check if user has used this voucher before
  static countUsageByUser(userId, voucherId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) as count
        FROM user_vouchers
        WHERE user_id = ? AND voucher_id = ? AND status = 'used'
      `;
      db.query(sql, [userId, voucherId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]?.count || 0);
      });
    });
  }
}

module.exports = UserVoucher;

