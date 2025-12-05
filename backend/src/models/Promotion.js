const db = require('../lib/db');

class Promotion {
  // Get all active promotions with optional filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      // Query based on actual database schema
      let sql = `
        SELECT 
          id, 
          title,
          description,
          image_url,
          slug,
          conditions_json,
          notes_json,
          start_date,
          end_date,
          is_active,
          created_at,
          updated_at
        FROM promotions 
        WHERE is_active = 1 
          AND (end_date >= CURDATE() OR end_date IS NULL)
      `;
      
      const params = [];
      
      if (filters.search) {
        sql += ' AND (title LIKE ? OR description LIKE ? OR slug LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }
      
      sql += ' ORDER BY created_at DESC';
      
      db.query(sql, params, (err, results) => {
        if (err) {
          console.error('Error fetching promotions:', err);
          console.error('SQL Error details:', err.sqlMessage || err.message);
          console.error('SQL Error code:', err.code);
          
          // If table doesn't exist or other non-critical errors, return empty array
          if (err.code === 'ER_NO_SUCH_TABLE' || err.code === '42S02') {
            console.warn('Promotions table does not exist, returning empty array');
            return resolve([]);
          }
          
          // For other errors, still reject
          return reject(err);
        }
        
        // If no results, return empty array (not an error)
        if (!results || results.length === 0) {
          console.log('No active promotions found');
          return resolve([]);
        }
        
        // Parse JSON fields for each promotion
        const parsedResults = results.map(promotion => {
          try {
            // Handle conditions_json - could be JSON string or already parsed
            if (promotion.conditions_json) {
              try {
                promotion.conditions = typeof promotion.conditions_json === 'string' 
                  ? JSON.parse(promotion.conditions_json) 
                  : promotion.conditions_json;
              } catch (parseErr) {
                console.warn('Error parsing conditions_json for promotion', promotion.id, ':', parseErr.message);
                promotion.conditions = null;
              }
            } else {
              promotion.conditions = null;
            }
            
            // Handle notes_json - could be JSON string or already parsed
            if (promotion.notes_json) {
              try {
                promotion.notes = typeof promotion.notes_json === 'string' 
                  ? JSON.parse(promotion.notes_json) 
                  : promotion.notes_json;
              } catch (parseErr) {
                console.warn('Error parsing notes_json for promotion', promotion.id, ':', parseErr.message);
                promotion.notes = null;
              }
            } else {
              promotion.notes = null;
            }
            
            // Ensure all required fields exist
            promotion.image_url = promotion.image_url || '';
            promotion.slug = promotion.slug || `promo-${promotion.id}`;
          } catch (parseError) {
            console.error('Error processing promotion:', promotion.id, parseError);
          }
          return promotion;
        });
        
        console.log(`Successfully loaded ${parsedResults.length} promotions`);
        resolve(parsedResults);
      });
    });
  }

  // Get promotion by slug
  static findBySlug(slug) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          id, 
          title,
          description,
          image_url,
          slug,
          conditions_json,
          notes_json,
          start_date,
          end_date,
          is_active,
          created_at,
          updated_at
        FROM promotions 
        WHERE (slug = ? OR CONCAT('promo-', id) = ?) 
          AND is_active = 1 
          AND (end_date >= CURDATE() OR end_date IS NULL)
      `;
      
      db.query(sql, [slug, slug], (err, results) => {
        if (err) {
          console.error('Error fetching promotion by slug:', err);
          return reject(err);
        }
        
        if (results.length === 0) {
          return resolve(null);
        }

        const promotion = results[0];
        
        // Parse JSON fields
        try {
          if (promotion.conditions_json) {
            promotion.conditions = typeof promotion.conditions_json === 'string' 
              ? JSON.parse(promotion.conditions_json) 
              : promotion.conditions_json;
          } else {
            promotion.conditions = null;
          }
          
          if (promotion.notes_json) {
            promotion.notes = typeof promotion.notes_json === 'string' 
              ? JSON.parse(promotion.notes_json) 
              : promotion.notes_json;
          } else {
            promotion.notes = null;
          }
          
          promotion.image_url = promotion.image_url || '';
          promotion.slug = promotion.slug || `promo-${promotion.id}`;
        } catch (parseError) {
          console.error('Error parsing promotion JSON:', parseError);
          // Continue with null values if parsing fails
        }

        resolve(promotion);
      });
    });
  }

  // Create new promotion
  static create(promotionData) {
    return new Promise((resolve, reject) => {
      const {
        title, description, image_url, slug, conditions, notes,
        start_date, end_date, is_active
      } = promotionData;

      const finalSlug = slug || (title ? title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') : `promo-${Date.now()}`);

      const sql = `
        INSERT INTO promotions 
        (title, description, image_url, slug, conditions_json, notes_json, 
         start_date, end_date, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        title,
        description || null,
        image_url || null,
        finalSlug,
        conditions ? JSON.stringify(conditions) : null,
        notes ? JSON.stringify(notes) : null,
        start_date || null,
        end_date || null,
        is_active !== undefined ? is_active : 1
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...promotionData, slug: finalSlug });
      });
    });
  }

  // Update promotion
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'title', 'description', 'image_url', 'slug', 'conditions', 'notes',
        'start_date', 'end_date', 'is_active'
      ];
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          // Map conditions/notes to conditions_json/notes_json
          if (key === 'conditions') {
            fields.push('conditions_json = ?');
            values.push(JSON.stringify(updateData[key]));
          } else if (key === 'notes') {
            fields.push('notes_json = ?');
            values.push(JSON.stringify(updateData[key]));
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
      const sql = `UPDATE promotions SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete promotion
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM promotions WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Promotion;

