const SettingsService = require('../services/SettingsService');
const { HTTP_STATUS } = require('../config/constants');
const { asyncHandler } = require('../middleware/errorHandler');

class SettingsController {
  // GET /api/admin/settings - Lấy tất cả cài đặt
  static async getSettings(req, res) {
    try {
      const settings = await SettingsService.getSettings();
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error getting settings:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: 'Không thể lấy cài đặt hệ thống'
      });
    }
  }

  // PUT /api/admin/settings - Cập nhật cài đặt
  static async updateSettings(req, res) {
    try {
      const settingsData = req.body;
      const updated = await SettingsService.updateSettings(settingsData);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: updated,
        message: 'Cập nhật cài đặt thành công'
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || 'Không thể cập nhật cài đặt'
      });
    }
  }
}

module.exports = SettingsController;

