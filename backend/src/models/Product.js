const db = require('../lib/db');

class Product {
  // Get all active products with optional filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          id, name, description, details, price, image_url, type, is_featured 
        FROM products 
        WHERE is_active = TRUE
      `;
      const params = [];

      // Support both old format (type as string) and new format (filters object)
      const type = typeof filters === 'string' ? filters : filters.type;

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      if (typeof filters === 'object' && filters.search) {
        sql += ' AND (name LIKE ? OR description LIKE ? OR details LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY type, is_featured DESC, name';

      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        
        // Convert price from DECIMAL to number and is_featured to boolean
        const products = results.map(product => ({
          ...product,
          price: parseFloat(product.price),
          is_featured: Boolean(product.is_featured)
        }));
        
        resolve(products);
      });
    });
  }

  // Get product by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM products WHERE id = ? AND is_active = TRUE';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        
        if (results.length === 0) {
          return resolve(null);
        }

        const product = results[0];
        product.price = parseFloat(product.price);
        product.is_featured = Boolean(product.is_featured);
        
        resolve(product);
      });
    });
  }

  // Create new product
  static create(productData) {
    return new Promise((resolve, reject) => {
      const { name, description, details, price, image_url, type, is_featured } = productData;

      const sql = `
        INSERT INTO products (name, description, details, price, image_url, type, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        name,
        description || null,
        details || null,
        price || 0,
        image_url || null,
        type,
        is_featured ? 1 : 0
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...productData });
      });
    });
  }

  // Update product
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['name', 'description', 'details', 'price', 'image_url', 'type', 'is_featured', 'is_active'];
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          // Convert boolean to int for is_featured and is_active
          if (key === 'is_featured' || key === 'is_active') {
            values.push(updateData[key] ? 1 : 0);
          } else {
            values.push(updateData[key]);
          }
        }
      });

      if (fields.length === 0) {
        return resolve(null);
      }

      values.push(id);
      const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete product (soft delete: set is_active = FALSE)
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE products SET is_active = FALSE WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Product;

