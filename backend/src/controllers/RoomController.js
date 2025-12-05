const RoomService = require('../services/RoomService');
const { HTTP_STATUS } = require('../config/constants');

class RoomController {
  static async getAllRooms(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        cinema_id: req.query.cinema_id
      };
      const result = await RoomService.getAllRooms(filters);
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await RoomService.getRoomById(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomsByCinemaId(req, res, next) {
    try {
      const { cinemaId } = req.params;
      const result = await RoomService.getRoomsByCinemaId(cinemaId);
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async getRoomLayout(req, res, next) {
    try {
      const { id } = req.params;
      const result = await RoomService.getRoomLayout(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      // Return with success flag to match frontend expectation
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async createRoom(req, res, next) {
    try {
      const roomData = req.body;
      const result = await RoomService.createRoom(roomData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.CREATED).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async updateRoom(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const result = await RoomService.updateRoom(id, updateData);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json(result.data);
    } catch (error) {
      next(error);
    }
  }

  static async deleteRoom(req, res, next) {
    try {
      const { id } = req.params;
      const result = await RoomService.deleteRoom(id);
      
      if (!result.success) {
        return res.status(result.status).json({ error: result.message });
      }
      
      res.status(HTTP_STATUS.OK).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RoomController;
