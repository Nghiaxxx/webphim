const db = require('../lib/db');

class Booking {
  // Get booked seats for a showtime (NEW: query from booking_seats table)
  static getBookedSeats(showtimeId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          bs.seat_row, 
          bs.seat_col,
          bs.seat_code,
          bs.seat_type
        FROM booking_seats bs
        JOIN bookings b ON bs.booking_id = b.id
        WHERE b.showtime_id = ?
          AND b.status IN ('confirmed', 'completed')
      `;
      db.query(sql, [showtimeId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Create booking with seats (NEW: supports multiple seats per booking)
  static createBooking(bookingData) {
    return new Promise((resolve, reject) => {
      // Start transaction
      db.getConnection((err, connection) => {
        if (err) return reject(err);

        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            return reject(err);
          }

          // 1. Insert booking
          const bookingSql = `
            INSERT INTO bookings 
            (showtime_id, customer_name, customer_phone, customer_email,
             total_seats_price, original_price, total_price, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
          `;
          
          const bookingValues = [
            bookingData.showtimeId,
            bookingData.customerName,
            bookingData.customerPhone,
            bookingData.customerEmail || null,
            bookingData.totalPrice || 0,
            bookingData.totalPrice || 0,
            bookingData.totalPrice || 0
          ];

          connection.query(bookingSql, bookingValues, (err, bookingResult) => {
            if (err) {
              return connection.rollback(() => {
                connection.release();
                reject(err);
              });
            }

            const bookingId = bookingResult.insertId;

            // 2. Insert seats
            if (!bookingData.seats || bookingData.seats.length === 0) {
              return connection.rollback(() => {
                connection.release();
                reject(new Error('No seats provided'));
              });
            }

            const seatsSql = `
              INSERT INTO booking_seats 
              (booking_id, seat_row, seat_col, seat_code, seat_price, seat_type) 
              VALUES ?
            `;

            const seatsValues = bookingData.seats.map(seat => [
              bookingId,
              seat.row,
              seat.col,
              seat.code || `${seat.row}${seat.col}`,
              seat.price || 0,
              seat.type || 'Standard'
            ]);

            connection.query(seatsSql, [seatsValues], (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  reject(err);
                });
              }

              // Commit transaction
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    reject(err);
                  });
                }

                connection.release();
                resolve({
                  bookingId,
                  affectedRows: bookingResult.affectedRows
                });
              });
            });
          });
        });
      });
    });
  }

  // Legacy method for backward compatibility
  static createMultiple(bookings) {
    // Convert old format to new format
    const bookingData = {
      showtimeId: bookings[0].showtimeId,
      customerName: bookings[0].customerName,
      customerPhone: bookings[0].customerPhone,
      totalPrice: bookings.length * 45000, // Default price
      seats: bookings.map(b => ({
        row: String.fromCharCode(64 + b.seatRow), // Convert 1→A, 2→B
        col: b.seatCol,
        code: `${String.fromCharCode(64 + b.seatRow)}${b.seatCol}`,
        price: 45000
      }))
    };
    
    return this.createBooking(bookingData);
  }

  // Get all bookings by user_id with full details
  static findAllByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          b.id,
          b.booking_code,
          b.customer_name,
          b.customer_phone,
          b.seat_row,
          b.seat_col,
          b.original_price,
          b.discount_amount,
          b.total_price,
          b.payment_method,
          b.payment_status,
          b.status,
          b.created_at,
          s.id AS showtime_id,
          s.start_time,
          s.end_time,
          s.price AS showtime_price,
          m.id AS movie_id,
          m.title AS movie_title,
          m.poster_url AS movie_poster,
          m.duration,
          r.id AS room_id,
          r.name AS room_name,
          c.id AS cinema_id,
          c.name AS cinema_name,
          c.address AS cinema_address,
          c.city AS cinema_city
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.id
        JOIN movies m ON s.movie_id = m.id
        LEFT JOIN rooms r ON s.room_id = r.id
        LEFT JOIN cinemas c ON r.cinema_id = c.id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC
      `;
      
      db.query(sql, [userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  // Get all bookings with filters (for admin)
  static findAll(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          b.id,
          b.user_id,
          b.booking_code,
          b.customer_name,
          b.customer_phone,
          b.seat_row,
          b.seat_col,
          b.original_price,
          b.discount_amount,
          b.total_price,
          b.payment_method,
          b.payment_status,
          b.status,
          b.created_at,
          s.id AS showtime_id,
          s.start_time,
          s.end_time,
          m.id AS movie_id,
          m.title AS movie_title,
          m.poster_url AS movie_poster,
          r.id AS room_id,
          r.name AS room_name,
          c.id AS cinema_id,
          c.name AS cinema_name,
          c.city AS cinema_city
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.id
        JOIN movies m ON s.movie_id = m.id
        LEFT JOIN rooms r ON s.room_id = r.id
        LEFT JOIN cinemas c ON r.cinema_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.status) {
        sql += ' AND b.status = ?';
        params.push(filters.status);
      }
      
      if (filters.payment_status) {
        sql += ' AND b.payment_status = ?';
        params.push(filters.payment_status);
      }
      
      if (filters.cinema_id) {
        sql += ' AND c.id = ?';
        params.push(filters.cinema_id);
      }
      
      if (filters.date_from) {
        sql += ' AND DATE(b.created_at) >= ?';
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        sql += ' AND DATE(b.created_at) <= ?';
        params.push(filters.date_to);
      }

      if (filters.search) {
        sql += ' AND (b.booking_code LIKE ? OR b.customer_name LIKE ? OR b.customer_phone LIKE ? OR m.title LIKE ? OR c.name LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      sql += ' ORDER BY b.created_at DESC';
      
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

  // Get booking by ID with full details (for admin)
  static findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          b.*,
          s.id AS showtime_id,
          s.start_time,
          s.end_time,
          s.price AS showtime_price,
          m.id AS movie_id,
          m.title AS movie_title,
          m.poster_url AS movie_poster,
          m.duration,
          r.id AS room_id,
          r.name AS room_name,
          c.id AS cinema_id,
          c.name AS cinema_name,
          c.address AS cinema_address,
          c.city AS cinema_city,
          u.id AS user_id_full,
          u.email AS user_email,
          u.full_name AS user_full_name
        FROM bookings b
        JOIN showtimes s ON b.showtime_id = s.id
        JOIN movies m ON s.movie_id = m.id
        LEFT JOIN rooms r ON s.room_id = r.id
        LEFT JOIN cinemas c ON r.cinema_id = c.id
        LEFT JOIN users u ON b.user_id = u.id
        WHERE b.id = ?
      `;
      
      db.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  }

  // Update booking
  static update(id, updateData) {
    return new Promise((resolve, reject) => {
      const allowedFields = [
        'payment_status', 
        'status', 
        'payment_method',
        'discount_amount',
        'total_price',
        'cancelled_at'
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
      const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }

  // Delete booking
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM bookings WHERE id = ?';
      db.query(sql, [id], (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = Booking;

