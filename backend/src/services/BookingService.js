const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Room = require('../models/Room');
const { HTTP_STATUS } = require('../config/constants');

class BookingService {
  static async getBookedSeats(showtimeId) {
    try {
      const seats = await Booking.getBookedSeats(showtimeId);
      return { success: true, data: seats };
    } catch (error) {
      throw error;
    }
  }

  static async createBooking(bookingData) {
    try {
      const { showtimeId, customerName, customerPhone, seats } = bookingData;

      // Verify showtime exists and get room layout
      const showtime = await Showtime.findByIdWithRoom(showtimeId);
      if (!showtime) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy suất chiếu'
        };
      }

      // Get room layout
      let roomLayout = null;
      if (showtime.room_id) {
        roomLayout = await Room.getLayoutConfig(showtime.room_id);
      }

      // If no room layout, use default layout (fallback)
      // This should match the DEFAULT_LAYOUT in frontend
      if (!roomLayout) {
        roomLayout = {
          rowLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
          seatsPerRow: {
            'A': 12, 'B': 12, 'C': 12, 'D': 12,
            'E': 12, 'F': 15, 'G': 15, 'H': 15, 'I': 15, 'J': 15, 'K': 15, 'L': 15,
            'M': 10, 'N': 5
          }
        };
      }

      // Validate seat data (NEW: Keep row as VARCHAR 'A', 'B', 'C'...)
      const seatsData = seats.map(seat => {
        const rowLetter = seat.row.toUpperCase();
        
        // Validate row exists in layout
        if (!roomLayout.rowLetters.includes(rowLetter)) {
          throw new Error(`Hàng ghế không hợp lệ: ${seat.row}`);
        }

        // Validate seat column
        const seatsInRow = roomLayout.seatsPerRow[rowLetter];
        if (!seatsInRow || seat.col < 1 || seat.col > seatsInRow) {
          throw new Error(`Số ghế không hợp lệ: ${rowLetter}${seat.col}`);
        }

        return {
          row: rowLetter,     // Keep as VARCHAR: 'A', 'B', 'C'...
          col: seat.col,      // INT: 1, 2, 3...
          code: `${rowLetter}${seat.col}`,  // 'A5', 'B12'...
          price: showtime.price || 0,
          type: 'Standard'    // TODO: Detect VIP/Couple from layout
        };
      });

      // Create booking with new structure
      const bookingData = {
        showtimeId,
        customerName,
        customerPhone,
        customerEmail: null,
        totalPrice: seatsData.reduce((sum, seat) => sum + parseFloat(seat.price), 0),
        seats: seatsData
      };

      const result = await Booking.createBooking(bookingData);

      return {
        success: true,
        data: {
          message: 'Đặt vé thành công',
          bookingId: result.bookingId,
          seats: seatsData.length
        }
      };
    } catch (error) {
      // Check for duplicate entry error
      if (error.code === 'ER_DUP_ENTRY') {
        return {
          success: false,
          status: HTTP_STATUS.CONFLICT,
          message: 'Ghế đã có người đặt, vui lòng chọn ghế khác'
        };
      }
      // Check for validation errors
      if (error.message && error.message.includes('không hợp lệ')) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: error.message
        };
      }
      throw error;
    }
  }

  static async getUserBookings(userId) {
    try {
      const bookings = await Booking.findAllByUserId(userId);
      
      // Format data for frontend
      const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        booking_code: booking.booking_code,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        seat: `${booking.seat_row}${booking.seat_col}`,
        seat_row: booking.seat_row,
        seat_col: booking.seat_col,
        original_price: parseFloat(booking.original_price) || 0,
        discount_amount: parseFloat(booking.discount_amount) || 0,
        total_price: parseFloat(booking.total_price) || 0,
        payment_method: booking.payment_method,
        payment_status: booking.payment_status,
        status: booking.status,
        created_at: booking.created_at,
        showtime: {
          id: booking.showtime_id,
          start_time: booking.start_time,
          end_time: booking.end_time,
          price: parseFloat(booking.showtime_price) || 0
        },
        movie: {
          id: booking.movie_id,
          title: booking.movie_title,
          poster_url: booking.movie_poster,
          duration: booking.duration
        },
        room: booking.room_id ? {
          id: booking.room_id,
          name: booking.room_name
        } : null,
        cinema: booking.cinema_id ? {
          id: booking.cinema_id,
          name: booking.cinema_name,
          address: booking.cinema_address,
          city: booking.cinema_city
        } : null
      }));

      return {
        success: true,
        data: formattedBookings
      };
    } catch (error) {
      throw error;
    }
  }

  static async getAllBookings(filters = {}) {
    try {
      const bookings = await Booking.findAll(filters);
      
      // Format data for admin
      const formattedBookings = bookings.map(booking => ({
        id: booking.id,
        booking_code: booking.booking_code,
        user_id: booking.user_id,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        seat: `${booking.seat_row}${booking.seat_col}`,
        seat_row: booking.seat_row,
        seat_col: booking.seat_col,
        original_price: parseFloat(booking.original_price) || 0,
        discount_amount: parseFloat(booking.discount_amount) || 0,
        total_price: parseFloat(booking.total_price) || 0,
        payment_method: booking.payment_method,
        payment_status: booking.payment_status,
        status: booking.status,
        created_at: booking.created_at,
        showtime: {
          id: booking.showtime_id,
          start_time: booking.start_time,
          end_time: booking.end_time
        },
        movie: {
          id: booking.movie_id,
          title: booking.movie_title,
          poster_url: booking.movie_poster
        },
        room: booking.room_id ? {
          id: booking.room_id,
          name: booking.room_name
        } : null,
        cinema: booking.cinema_id ? {
          id: booking.cinema_id,
          name: booking.cinema_name,
          city: booking.cinema_city
        } : null
      }));

      return {
        success: true,
        data: formattedBookings
      };
    } catch (error) {
      throw error;
    }
  }

  static async getBookingById(id) {
    try {
      const booking = await Booking.findById(id);
      
      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy đặt vé'
        };
      }

      // Format data for admin
      const formattedBooking = {
        id: booking.id,
        booking_code: booking.booking_code,
        user_id: booking.user_id,
        user: booking.user_id_full ? {
          id: booking.user_id_full,
          email: booking.user_email,
          full_name: booking.user_full_name
        } : null,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        seat_row: booking.seat_row,
        seat_col: booking.seat_col,
        original_price: parseFloat(booking.original_price) || 0,
        discount_amount: parseFloat(booking.discount_amount) || 0,
        total_price: parseFloat(booking.total_price) || 0,
        payment_method: booking.payment_method,
        payment_status: booking.payment_status,
        status: booking.status,
        cancelled_at: booking.cancelled_at,
        qr_code: booking.qr_code,
        created_at: booking.created_at,
        showtime: {
          id: booking.showtime_id,
          start_time: booking.start_time,
          end_time: booking.end_time,
          price: parseFloat(booking.showtime_price) || 0
        },
        movie: {
          id: booking.movie_id,
          title: booking.movie_title,
          poster_url: booking.movie_poster,
          duration: booking.duration
        },
        room: booking.room_id ? {
          id: booking.room_id,
          name: booking.room_name
        } : null,
        cinema: booking.cinema_id ? {
          id: booking.cinema_id,
          name: booking.cinema_name,
          address: booking.cinema_address,
          city: booking.cinema_city
        } : null
      };

      return {
        success: true,
        data: formattedBooking
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateBooking(id, updateData) {
    try {
      // Check if booking exists
      const booking = await Booking.findById(id);
      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy đặt vé'
        };
      }

      // Set cancelled_at if status is being changed to cancelled
      if (updateData.status === 'cancelled' && booking.status !== 'cancelled') {
        updateData.cancelled_at = new Date();
      }

      const result = await Booking.update(id, updateData);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      // Get updated booking
      const updatedBooking = await Booking.findById(id);
      return {
        success: true,
        data: updatedBooking
      };
    } catch (error) {
      throw error;
    }
  }

  static async deleteBooking(id) {
    try {
      // Check if booking exists
      const booking = await Booking.findById(id);
      if (!booking) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy đặt vé'
        };
      }

      const result = await Booking.delete(id);
      if (!result) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa đặt vé'
        };
      }

      return {
        success: true,
        message: 'Xóa đặt vé thành công'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BookingService;

