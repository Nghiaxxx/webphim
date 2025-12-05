const ShowtimeService = require('../services/ShowtimeService');
const { HTTP_STATUS } = require('../config/constants');

class ShowtimeController {
  static async getAllShowtimes(req, res, next) {
    try {
      const filters = {
        movieId: req.query.movieId || null,
        roomId: req.query.roomId || null,
        search: req.query.search
      };
      const result = await ShowtimeService.getAllShowtimes(filters);
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async createShowtime(req, res, next) {
    try {
      const result = await ShowtimeService.createShowtime(req.body);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async createMultipleShowtimes(req, res, next) {
    try {
      console.log('createMultipleShowtimes called');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const { showtimes } = req.body;
      
      if (!showtimes) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
          error: 'Thiếu dữ liệu showtimes' 
        });
      }
      
      const result = await ShowtimeService.createMultipleShowtimes(showtimes);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.CREATED).json({
        data: result.data,
        message: result.message
      });
    } catch (error) {
      console.error('Error in createMultipleShowtimes:', error);
      next(error);
    }
  }

  static async updateShowtime(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ShowtimeService.updateShowtime(id, req.body);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async deleteShowtime(req, res, next) {
    try {
      const { id } = req.params;
      const result = await ShowtimeService.deleteShowtime(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ShowtimeController;

