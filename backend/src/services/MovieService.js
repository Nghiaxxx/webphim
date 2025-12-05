const Movie = require('../models/Movie');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

class MovieService {
  static async getAllMovies(filters) {
    try {
      // Support both old format (status as string) and new format (filters object)
      const filterObj = typeof filters === 'string' 
        ? { status: filters } 
        : (filters || {});
      const movies = await Movie.findAll(filterObj);
      return { success: true, data: movies };
    } catch (error) {
      throw error;
    }
  }

  static async getMovieById(id) {
    try {
      const movie = await Movie.findById(id);
      if (!movie) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy phim'
        };
      }
      return { success: true, data: movie };
    } catch (error) {
      throw error;
    }
  }

  static async createMovie(movieData) {
    try {
      const movie = await Movie.create(movieData);
      return { success: true, data: movie };
    } catch (error) {
      throw error;
    }
  }

  static async updateMovie(id, updateData) {
    try {
      const exists = await Movie.findById(id);
      if (!exists) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy phim'
        };
      }

      const updated = await Movie.update(id, updateData);
      if (!updated) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không có dữ liệu để cập nhật'
        };
      }

      const movie = await Movie.findById(id);
      return { success: true, data: movie };
    } catch (error) {
      throw error;
    }
  }

  static async deleteMovie(id) {
    try {
      const exists = await Movie.findById(id);
      if (!exists) {
        return {
          success: false,
          status: HTTP_STATUS.NOT_FOUND,
          message: 'Không tìm thấy phim'
        };
      }

      const deleted = await Movie.delete(id);
      if (!deleted) {
        return {
          success: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: 'Không thể xóa phim'
        };
      }

      return { success: true, message: 'Xóa phim thành công' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MovieService;

