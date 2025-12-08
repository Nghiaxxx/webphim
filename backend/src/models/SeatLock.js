const db = require('../lib/db');

class SeatLock {
  // Lock một hoặc nhiều ghế
  static async lockSeats(showtimeId, seats, sessionId, expiresInSeconds = 300) {
    return new Promise(async (resolve, reject) => {
      db.getConnection(async (err, connection) => {
        if (err) return reject(err);

        connection.beginTransaction(async (err) => {
          if (err) {
            connection.release();
            return reject(err);
          }
    
          // Xóa các lock cũ đã hết hạn
          connection.query(
            'DELETE FROM seat_locks WHERE expires_at < NOW()',
            (err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  reject(err);
                });
              }

              const lockedSeats = [];
              const failedSeats = [];
              let processed = 0;

              const processSeat = (seat) => {
                // Kiểm tra xem ghế đã bị lock bởi session khác chưa
                connection.query(
                  `SELECT * FROM seat_locks 
                   WHERE showtime_id = ? AND seat_row = ? AND seat_col = ? 
                   AND expires_at > NOW() AND session_id != ?`,
                  [showtimeId, seat.row, seat.col, sessionId],
                  (err, existingLocks) => {
                    if (err) {
                      failedSeats.push({ row: seat.row, col: seat.col, reason: 'Lỗi khi kiểm tra lock' });
                      checkComplete();
                      return;
                    }

                    if (existingLocks && existingLocks.length > 0) {
                      failedSeats.push({ row: seat.row, col: seat.col, reason: 'Ghế đang được người khác chọn' });
                      checkComplete();
                      return;
                    }

                    // Kiểm tra xem ghế đã được đặt chưa
                    connection.query(
                      `SELECT bs.* FROM booking_seats bs
                       JOIN bookings b ON bs.booking_id = b.id
                       WHERE b.showtime_id = ? 
                       AND (bs.seat_row = ? OR CAST(bs.seat_row AS CHAR) = ?)
                       AND bs.seat_col = ?
                       AND b.status NOT IN ('cancelled', 'expired')`,
                      [showtimeId, seat.row, seat.row, seat.col],
                      (err, bookingSeats) => {
                        if (err) {
                          // Nếu bảng booking_seats không tồn tại, check bookings trực tiếp
                          checkBookingsDirect();
                          return;
                        }

                        if (bookingSeats && bookingSeats.length > 0) {
                          failedSeats.push({ row: seat.row, col: seat.col, reason: 'Ghế đã được đặt' });
                          checkComplete();
                          return;
                        }

                        checkBookingsDirect();
                      }
                    );

                    const checkBookingsDirect = () => {
                      connection.query(
                        `SELECT * FROM bookings 
                         WHERE showtime_id = ? 
                         AND (seat_row = ? OR CAST(seat_row AS CHAR) = ?)
                         AND seat_col = ? 
                         AND status NOT IN ('cancelled', 'expired')`,
                        [showtimeId, seat.row, seat.row, seat.col],
                        (err, bookings) => {
                          if (err) {
                            failedSeats.push({ row: seat.row, col: seat.col, reason: 'Lỗi khi kiểm tra booking' });
                            checkComplete();
                            return;
                          }

                          if (bookings && bookings.length > 0) {
                            failedSeats.push({ row: seat.row, col: seat.col, reason: 'Ghế đã được đặt' });
                            checkComplete();
                            return;
                          }

                          // Xóa lock cũ của session này (nếu có)
                          connection.query(
                            'DELETE FROM seat_locks WHERE showtime_id = ? AND seat_row = ? AND seat_col = ? AND session_id = ?',
                            [showtimeId, seat.row, seat.col, sessionId],
                            (err) => {
                              if (err) {
                                failedSeats.push({ row: seat.row, col: seat.col, reason: 'Lỗi khi xóa lock cũ' });
                                checkComplete();
                                return;
                              }

                              // Tạo lock mới
                              const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
                              connection.query(
                                `INSERT INTO seat_locks (showtime_id, seat_row, seat_col, session_id, expires_at) 
                                 VALUES (?, ?, ?, ?, ?)`,
                                [showtimeId, seat.row, seat.col, sessionId, expiresAt],
                                (err) => {
                                  if (err) {
                                    if (err.code === 'ER_DUP_ENTRY') {
                                      failedSeats.push({ row: seat.row, col: seat.col, reason: 'Ghế đang được người khác chọn' });
                                    } else {
                                      failedSeats.push({ row: seat.row, col: seat.col, reason: 'Lỗi khi tạo lock' });
                                    }
                                  } else {
                                    lockedSeats.push({ row: seat.row, col: seat.col });
                                  }
                                  checkComplete();
                                }
                              );
                            }
                          );
                        }
                      );
                    };

                    const checkComplete = () => {
                      processed++;
                      if (processed === seats.length) {
                        connection.commit((err) => {
                          if (err) {
                            return connection.rollback(() => {
                              connection.release();
                              reject(err);
                            });
                          }
                          connection.release();
                          resolve({ lockedSeats, failedSeats });
                        });
                      }
                    };
                  }
                );
              };

              // Process all seats
              if (seats.length === 0) {
                connection.commit((err) => {
                  if (err) {
                    return connection.rollback(() => {
                      connection.release();
                      reject(err);
                    });
                  }
                  connection.release();
                  resolve({ lockedSeats, failedSeats });
                });
              } else {
                seats.forEach(processSeat);
              }
            }
          );
        });
      });
    });
  }

  // Unlock một hoặc nhiều ghế
  static unlockSeats(showtimeId, seats, sessionId) {
    return new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) return reject(err);

        const placeholders = seats.map(() => '(showtime_id = ? AND seat_row = ? AND seat_col = ?)').join(' OR ');
        const values = seats.flatMap(seat => [showtimeId, seat.row, seat.col]);

        connection.query(
          `DELETE FROM seat_locks 
           WHERE (${placeholders}) AND session_id = ?`,
          [...values, sessionId],
          (err) => {
            connection.release();
            if (err) return reject(err);
            resolve({ success: true });
          }
        );
      });
    });
  }

  // Lấy danh sách ghế đang bị lock cho một showtime
  static getLockedSeats(showtimeId) {
    return new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) return reject(err);

        // Xóa các lock đã hết hạn
        connection.query(
          'DELETE FROM seat_locks WHERE expires_at < NOW()',
          (err) => {
            if (err) {
              connection.release();
              return reject(err);
            }

            // Lấy các lock còn hiệu lực
            connection.query(
              `SELECT seat_row, seat_col, session_id, expires_at 
               FROM seat_locks 
               WHERE showtime_id = ? AND expires_at > NOW()`,
              [showtimeId],
              (err, locks) => {
                connection.release();
                if (err) return reject(err);
                resolve(locks || []);
              }
            );
          }
        );
      });
    });
  }

  // Xóa tất cả lock của một session
  static clearSessionLocks(sessionId) {
    return new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) return reject(err);

        connection.query(
          'DELETE FROM seat_locks WHERE session_id = ?',
          [sessionId],
          (err) => {
            connection.release();
            if (err) return reject(err);
            resolve({ success: true });
          }
        );
      });
    });
  }

  // Cleanup: Xóa tất cả lock đã hết hạn
  static cleanupExpiredLocks() {
    return new Promise((resolve, reject) => {
      db.getConnection((err, connection) => {
        if (err) return reject(err);

        connection.query(
          'DELETE FROM seat_locks WHERE expires_at < NOW()',
          (err, result) => {
            connection.release();
            if (err) return reject(err);
            resolve({ deleted: result?.affectedRows || 0 });
          }
        );
      });
    });
  }
}

module.exports = SeatLock;

