const BookingService = require('../services/BookingService');
const { HTTP_STATUS } = require('../config/constants');

class BookingController {
  static async getBookedSeats(req, res, next) {
    try {
      const { showtimeId } = req.params;
      const result = await BookingService.getBookedSeats(showtimeId);
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async createBooking(req, res, next) {
    try {
      const bookingData = req.body;
      const result = await BookingService.createBooking(bookingData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getUserBookings(req, res, next) {
    try {
      const userId = req.user.userId;
      const result = await BookingService.getUserBookings(userId);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getAllBookings(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        payment_status: req.query.payment_status,
        cinema_id: req.query.cinema_id,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset
      };
      
      const result = await BookingService.getAllBookings(filters);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getBookingById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await BookingService.getBookingById(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async updateBooking(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await BookingService.updateBooking(id, updateData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async deleteBooking(req, res, next) {
    try {
      const { id } = req.params;
      const result = await BookingService.deleteBooking(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookingController;

