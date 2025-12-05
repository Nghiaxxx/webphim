const db = require('../lib/db');

class Room {
  // Get all rooms with optional filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT id, cinema_id, name, layout_config, created_at, updated_at FROM rooms WHERE 1=1';
      const params = [];
      
      if (filters.search) {
        sql += ' AND name LIKE ?';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm);
      }
      
      if (filters.cinema_id) {
        sql += ' AND cinema_id = ?';
        params.push(filters.cinema_id);
      }
      
      sql += ' ORDER BY cinema_id, name';
      
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Get room by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM rooms WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Get rooms by cinema ID
  static findByCinemaId(cinemaId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, cinema_id, name, layout_config FROM rooms WHERE cinema_id = ? ORDER BY name';
      db.query(sql, [cinemaId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Get room layout config (parsed JSON)
  static getLayoutConfig(roomId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT layout_config FROM rooms WHERE id = ?';
      db.query(sql, [roomId], (err, results) => {
        if (err) return reject(err);
        if (!results[0]) {
          return resolve(null);
        }
        // Parse JSON if it's a string
        const config = typeof results[0].layout_config === 'string' 
          ? JSON.parse(results[0].layout_config) 
          : results[0].layout_config;
        resolve(config);
      });
    });
  }

  // Get current showtimes for a room (showing now or upcoming today)
  static getCurrentShowtimes(roomId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          s.id,
          s.movie_id,
          s.start_time,
          s.end_time,
          s.price,
          m.title AS movie_title,
          m.poster_url AS movie_poster
        FROM showtimes s
        JOIN movies m ON s.movie_id = m.id
        WHERE s.room_id = ?
          AND s.status = 'active'
          AND s.start_time >= NOW()
          AND DATE(s.start_time) = CURDATE()
        ORDER BY s.start_time ASC
        LIMIT 5
      `;
      db.query(sql, [roomId], (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      });
    });
  }

  // Create new room
  static create(roomData) {
    return new Promise((resolve, reject) => {
      const { cinema_id, name, screen_type, layout_config } = roomData;
      
      // Convert layout_config to JSON string if it's an object
      const layoutConfigJson = typeof layout_config === 'object' 
        ? JSON.stringify(layout_config) 
        : layout_config;

      const sql = `
        INSERT INTO rooms (cinema_id, name, screen_type, layout_config)
        VALUES (?, ?, ?, ?)
      `;
      
      const params = [
        cinema_id,
        name,
        screen_type || null,
        layoutConfigJson || null
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...roomData });
      });
    });
  }

  // Update room
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['cinema_id', 'name', 'screen_type', 'layout_config'];
      
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key) && updateData[key] !== undefined) {
          // Convert layout_config to JSON string if it's an object
          if (key === 'layout_config' && typeof updateData[key] === 'object') {
            fields.push(`${key} = ?`);
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
      const sql = `UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete room
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM rooms WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Room;
