const db = require('../lib/db');

class Showtime {
  // Get all showtimes with optional filters
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      // Support both old format (movieId, roomId as separate params) and new format (filters object)
      const movieId = typeof filters === 'object' ? filters.movieId : filters;
      const roomId = typeof filters === 'object' ? filters.roomId : null;
      const search = typeof filters === 'object' ? filters.search : null;
      
      // Query with new structure: showtimes → rooms → cinemas
      let sql = `
        SELECT 
          s.id, 
          s.movie_id, 
          s.start_time,
          s.end_time,
          s.price,
          s.room_id,
          s.status,
          m.title AS movie_title,
          m.poster_url AS movie_poster,
          r.id AS room_id_full,
          r.name AS room_name,
          r.screen_type,
          r.cinema_id,
          c.id AS cinema_id_full,
          c.name AS cinema_name,
          c.address AS cinema_address,
          c.city AS cinema_city
        FROM showtimes s 
        JOIN movies m ON s.movie_id = m.id
        LEFT JOIN rooms r ON s.room_id = r.id
        LEFT JOIN cinemas c ON r.cinema_id = c.id
      `;
      
      const params = [];
      const conditions = [];

      if (movieId) {
        conditions.push('s.movie_id = ?');
        params.push(movieId);
      }

      if (roomId) {
        conditions.push('s.room_id = ?');
        params.push(roomId);
      }

      // Only show active showtimes
      conditions.push('s.status = ?');
      params.push('active');

      if (search) {
        conditions.push('(m.title LIKE ? OR r.name LIKE ? OR c.name LIKE ? OR c.city LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY s.start_time ASC, c.name ASC';

      db.query(sql, params, (err, results) => {
        if (err) {
          console.error('Query error in Showtime.findAll:', err.message);
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  // Get showtime by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM showtimes WHERE id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Get showtime by ID with room layout
  static findByIdWithRoom(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          s.*,
          r.id AS room_id_full,
          r.layout_config
        FROM showtimes s
        LEFT JOIN rooms r ON s.room_id = r.id
        WHERE s.id = ?
      `;
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        if (!results[0]) {
          return resolve(null);
        }
        const showtime = results[0];
        // Parse layout_config if exists
        if (showtime.layout_config) {
          showtime.layout_config = typeof showtime.layout_config === 'string'
            ? JSON.parse(showtime.layout_config)
            : showtime.layout_config;
        }
        resolve(showtime);
      });
    });
  }

  // Create new showtime
  static create(showtimeData) {
    return new Promise((resolve, reject) => {
      const {
        movie_id, start_time, end_time, price, room_id, status
      } = showtimeData;

      const sql = `
        INSERT INTO showtimes 
        (movie_id, start_time, end_time, price, room_id, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        movie_id,
        start_time,
        end_time || null,
        price || 0,
        room_id || null,
        status || 'active'
      ];

      db.query(sql, params, (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, ...showtimeData });
      });
    });
  }

  // Create multiple showtimes at once
  static createMultiple(showtimesData) {
    return new Promise((resolve, reject) => {
      if (!showtimesData || showtimesData.length === 0) {
        return reject(new Error('Không có dữ liệu suất chiếu'));
      }

      const sql = `
        INSERT INTO showtimes 
        (movie_id, start_time, end_time, price, room_id, status)
        VALUES ?
      `;
      
      const values = showtimesData.map(st => [
        st.movie_id,
        st.start_time,
        st.end_time || null,
        st.price || 0,
        st.room_id || null,
        st.status || 'active'
      ]);

      db.query(sql, [values], (err, result) => {
        if (err) {
          console.error('Error creating multiple showtimes:', err);
          return reject(err);
        }
        // For bulk insert, MySQL returns insertId of first row
        // IDs are sequential: insertId, insertId+1, insertId+2, ...
        const createdShowtimes = showtimesData.map((st, index) => ({
          id: result.insertId + index,
          ...st
        }));
        resolve(createdShowtimes);
      });
    });
  }

  // Update showtime
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = ['movie_id', 'start_time', 'end_time', 'price', 'room_id', 'status'];
      
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
      const sql = `UPDATE showtimes SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete showtime
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM showtimes WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Showtime;

