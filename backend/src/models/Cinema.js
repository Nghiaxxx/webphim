const db = require('../lib/db');

class Cinema {
  // Get all cinemas with optional filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT id, name, address, phone_number, city FROM cinemas WHERE 1=1';
      const params = [];
      
      if (filters.search) {
        sql += ' AND (name LIKE ? OR address LIKE ? OR city LIKE ? OR phone_number LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      sql += ' ORDER BY name';
      
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Get cinema by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM cinemas WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Create new cinema
  static create(cinemaData) {
    return new Promise((resolve, reject) => {
      const { name, address, phone_number, city } = cinemaData;

      const sql = `
        INSERT INTO cinemas (name, address, phone_number, city)
        VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        name,
        address || null,
        phone_number || null,
        city || null
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...cinemaData });
      });
    });
  }

  // Update cinema
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['name', 'address', 'phone_number', 'city'];
      
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
      const sql = `UPDATE cinemas SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete cinema
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM cinemas WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Get cinema with rooms and showtimes
  static findByIdWithDetails(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          c.*,
          r.id AS room_id,
          r.name AS room_name,
          r.screen_type AS room_screen_type,
          r.layout_config AS room_layout_config,
          s.id AS showtime_id,
          s.movie_id,
          s.start_time,
          s.end_time,
          s.price AS showtime_price,
          s.status AS showtime_status,
          m.title AS movie_title,
          m.poster_url AS movie_poster
        FROM cinemas c
        LEFT JOIN rooms r ON c.id = r.cinema_id
        LEFT JOIN showtimes s ON r.id = s.room_id AND s.status = 'active'
        LEFT JOIN movies m ON s.movie_id = m.id
        WHERE c.id = ?
        ORDER BY r.name ASC, s.start_time ASC
      `;
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) {
          return resolve(null);
        }
        
        // Group results by room
        const cinema = {
          id: results[0].id,
          name: results[0].name,
          address: results[0].address,
          phone_number: results[0].phone_number,
          city: results[0].city,
          created_at: results[0].created_at,
          updated_at: results[0].updated_at,
          rooms: []
        };

        const roomsMap = new Map();
        
        results.forEach(row => {
          if (row.room_id) {
            if (!roomsMap.has(row.room_id)) {
              roomsMap.set(row.room_id, {
                id: row.room_id,
                name: row.room_name,
                screen_type: row.room_screen_type,
                layout_config: row.room_layout_config ? 
                  (typeof row.room_layout_config === 'string' ? JSON.parse(row.room_layout_config) : row.room_layout_config) 
                  : null,
                showtimes: []
              });
            }
            
            if (row.showtime_id) {
              roomsMap.get(row.room_id).showtimes.push({
                id: row.showtime_id,
                movie_id: row.movie_id,
                movie_title: row.movie_title,
                movie_poster: row.movie_poster,
                start_time: row.start_time,
                end_time: row.end_time,
                price: row.showtime_price,
                status: row.showtime_status
              });
            }
          }
        });

        cinema.rooms = Array.from(roomsMap.values());
        resolve(cinema);
      });
    });
  }
}

module.exports = Cinema;

