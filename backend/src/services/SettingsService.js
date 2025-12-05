const db = require('../lib/db');
const { HTTP_STATUS } = require('../config/constants');

class SettingsService {
  // Default settings
  static getDefaultSettings() {
    return {
      siteName: 'WebPhim Cinema',
      siteDescription: 'Hệ thống đặt vé xem phim trực tuyến',
      maintenanceMode: false,
      allowRegistration: true,
      maxBookingPerUser: 10,
      ticketExpiryMinutes: 15,
      emailNotifications: true,
      smsNotifications: false
    };
  }

  // Get all settings
  static async getSettings() {
    return new Promise((resolve, reject) => {
      // Try to get from database first
      const sql = `SELECT setting_key, setting_value FROM system_settings`;
      
      db.query(sql, (err, results) => {
        if (err) {
          // If table doesn't exist, return defaults
          if (err.code === 'ER_NO_SUCH_TABLE' || err.code === '42S02') {
            console.log('Settings table does not exist, returning defaults');
            return resolve(this.getDefaultSettings());
          }
          return reject(err);
        }

        // If no settings in DB, return defaults
        if (!results || results.length === 0) {
          return resolve(this.getDefaultSettings());
        }

        // Convert database results to object
        const settings = this.getDefaultSettings();
        results.forEach(row => {
          const key = row.setting_key;
          let value = row.setting_value;
          
          // Parse JSON values
          if (value && (value.startsWith('{') || value.startsWith('[') || value === 'true' || value === 'false' || !isNaN(value))) {
            try {
              if (value === 'true') value = true;
              else if (value === 'false') value = false;
              else if (!isNaN(value) && value !== '') value = Number(value);
              else value = JSON.parse(value);
            } catch (e) {
              // Keep as string if not valid JSON
            }
          }
          
          settings[key] = value;
        });

        resolve(settings);
      });
    });
  }

  // Update settings
  static async updateSettings(settingsData) {
    return new Promise((resolve, reject) => {
      // Ensure table exists
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS system_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_setting_key (setting_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      db.query(createTableSql, (err) => {
        if (err) {
          return reject(err);
        }

        // Update or insert each setting
        const updates = Object.keys(settingsData).map(key => {
          return new Promise((resolveUpdate, rejectUpdate) => {
            const value = typeof settingsData[key] === 'object' 
              ? JSON.stringify(settingsData[key]) 
              : String(settingsData[key]);
            
            const sql = `
              INSERT INTO system_settings (setting_key, setting_value)
              VALUES (?, ?)
              ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `;
            
            db.query(sql, [key, value], (err) => {
              if (err) return rejectUpdate(err);
              resolveUpdate();
            });
          });
        });

        Promise.all(updates)
          .then(() => {
            // Return updated settings
            this.getSettings()
              .then(resolve)
              .catch(reject);
          })
          .catch(reject);
      });
    });
  }
}

module.exports = SettingsService;

