const CinemaService = require('../services/CinemaService');
const { HTTP_STATUS } = require('../config/constants');

class CinemaController {
  static async getAllCinemas(req, res, next) {
    try {
      const filters = {
        search: req.query.search
      };
      const result = await CinemaService.getAllCinemas(filters);
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getCinemaById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CinemaService.getCinemaById(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async createCinema(req, res, next) {
    try {
      const cinemaData = req.body;
      const result = await CinemaService.createCinema(cinemaData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async updateCinema(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await CinemaService.updateCinema(id, updateData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCinema(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CinemaService.deleteCinema(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async getCinemaWithDetails(req, res, next) {
    try {
      const { id } = req.params;
      const result = await CinemaService.getCinemaWithDetails(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CinemaController;

