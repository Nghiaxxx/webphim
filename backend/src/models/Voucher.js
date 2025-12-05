const db = require('../lib/db');

class Voucher {
  // Get all vouchers with optional filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          id, code, name, description, discount_type, discount_value, max_discount,
          min_order_amount, max_usage_per_user, total_quantity, used_count,
          movie_ids, cinema_ids, start_date, end_date, status,
          created_at, updated_at
        FROM vouchers
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.status) {
        sql += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.active_only) {
        sql += ' AND status = "active" AND start_date <= NOW() AND end_date >= NOW()';
      }

      if (filters.search) {
        sql += ' AND (code LIKE ? OR name LIKE ? OR description LIKE ?)';
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

  // Get voucher by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM vouchers WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Get voucher by code
  static findByCode(code) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM vouchers WHERE code = ?';
      db.query(sql, [code], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Create new voucher
  static create(voucherData) {
    return new Promise((resolve, reject) => {
      const {
        code,
        name,
        description,
        discount_type,
        discount_value,
        max_discount,
        min_order_amount,
        max_usage_per_user,
        total_quantity,
        movie_ids,
        cinema_ids,
        start_date,
        end_date,
        status
      } = voucherData;

      // Convert arrays to JSON strings if provided
      const movieIdsJson = Array.isArray(movie_ids) 
        ? JSON.stringify(movie_ids) 
        : movie_ids;
      const cinemaIdsJson = Array.isArray(cinema_ids) 
        ? JSON.stringify(cinema_ids) 
        : cinema_ids;

      const sql = `
        INSERT INTO vouchers 
        (code, name, description, discount_type, discount_value, max_discount,
         min_order_amount, max_usage_per_user, total_quantity, movie_ids, cinema_ids,
         start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        code,
        name,
        description || null,
        discount_type,
        discount_value,
        max_discount || null,
        min_order_amount || 0,
        max_usage_per_user || 1,
        total_quantity || null,
        movieIdsJson || null,
        cinemaIdsJson || null,
        start_date,
        end_date,
        status || 'active'
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...voucherData });
      });
    });
  }

  // Update voucher
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'name',
        'description',
        'discount_type',
        'discount_value',
        'max_discount',
        'min_order_amount',
        'max_usage_per_user',
        'total_quantity',
        'movie_ids',
        'cinema_ids',
        'start_date',
        'end_date',
        'status'
      ];
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          // Convert arrays to JSON strings
          if (key === 'movie_ids' || key === 'cinema_ids') {
            fields.push(`${key} = ?`);
            values.push(Array.isArray(updateData[key]) 
              ? JSON.stringify(updateData[key]) 
              : updateData[key]);
          } else {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
          }
        }
      });

      if (fields.length === 0) {
        return resolve(null);
      }

      values.push(id);
      const sql = `UPDATE vouchers SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete voucher
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM vouchers WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Increment used_count
  static incrementUsedCount(id) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE vouchers SET used_count = used_count + 1 WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Voucher;

