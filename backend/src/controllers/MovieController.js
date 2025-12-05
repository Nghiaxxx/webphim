const MovieService = require('../services/MovieService');
const { HTTP_STATUS } = require('../config/constants');

class MovieController {
  static async getAllMovies(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        search: req.query.search
      };
      const result = await MovieService.getAllMovies(filters);
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getMovieById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MovieService.getMovieById(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async createMovie(req, res, next) {
    try {
      console.log('Create movie - Request body:', JSON.stringify(req.body, null, 2));
      console.log('Director in request:', req.body.director);
      const result = await MovieService.createMovie(req.body);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async updateMovie(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MovieService.updateMovie(id, req.body);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async deleteMovie(req, res, next) {
    try {
      const { id } = req.params;
      const result = await MovieService.deleteMovie(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MovieController;

