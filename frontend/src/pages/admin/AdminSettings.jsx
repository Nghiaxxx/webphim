import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import Loading from '../../components/common/Loading';
import '../../styles/admin/AdminPage.css';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'WebPhim Cinema',
    siteDescription: 'Hệ thống đặt vé xem phim trực tuyến',
    maintenanceMode: false,
    allowRegistration: true,
    maxBookingPerUser: 10,
    ticketExpiryMinutes: 15,
    emailNotifications: true,
    smsNotifications: false
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.settings.get();
      if (data && data.data) {
        setSettings(data.data);
      } else if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setSaveMessage('Không thể tải cài đặt từ server. Sử dụng giá trị mặc định.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage('');
    
    try {
      const result = await adminAPI.settings.update(settings);
      
      if (result && result.data) {
        setSettings(result.data);
      }
      
      setSaveMessage('Đã lưu cài đặt thành công!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveMessage('Có lỗi xảy ra khi lưu cài đặt: ' + (err.message || 'Vui lòng thử lại'));
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Cài đặt hệ thống</h1>
          <p className="page-subtitle">Quản lý các cài đặt chung của hệ thống</p>
        </div>
        <button 
          className="primary-btn" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>

      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('thành công') ? 'success' : 'error'}`}>
          {saveMessage}
        </div>
      )}

      <div className="page-content">
        {loading ? (
          <Loading message="Đang tải cài đặt..." />
        ) : (
        <div className="settings-sections">
          {/* General Settings */}
          <div className="settings-section">
            <h2 className="section-title">
              <i className="fa-solid fa-gear"></i> Cài đặt chung
            </h2>
            <div className="settings-form">
              <div className="form-group">
                <label>Tên website</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleChange('siteName', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Mô tả website</label>
                <textarea
                  value={settings.siteDescription}
                  onChange={(e) => handleChange('siteDescription', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="settings-section">
            <h2 className="section-title">
              <i className="fa-solid fa-server"></i> Cài đặt hệ thống
            </h2>
            <div className="settings-form">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  />
                  <span>Chế độ bảo trì</span>
                </label>
                <p className="form-help">Khi bật, chỉ admin mới có thể truy cập hệ thống</p>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                  />
                  <span>Cho phép đăng ký tài khoản mới</span>
                </label>
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="settings-section">
            <h2 className="section-title">
              <i className="fa-solid fa-ticket"></i> Cài đặt đặt vé
            </h2>
            <div className="settings-form">
              <div className="form-group">
                <label>Số vé tối đa mỗi đơn đặt</label>
                <input
                  type="number"
                  value={settings.maxBookingPerUser}
                  onChange={(e) => handleChange('maxBookingPerUser', parseInt(e.target.value))}
                  className="form-input"
                  min="1"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label>Thời gian hết hạn đặt vé (phút)</label>
                <input
                  type="number"
                  value={settings.ticketExpiryMinutes}
                  onChange={(e) => handleChange('ticketExpiryMinutes', parseInt(e.target.value))}
                  className="form-input"
                  min="5"
                  max="60"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-section">
            <h2 className="section-title">
              <i className="fa-solid fa-bell"></i> Cài đặt thông báo
            </h2>
            <div className="settings-form">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  />
                  <span>Gửi thông báo qua Email</span>
                </label>
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                  />
                  <span>Gửi thông báo qua SMS</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;

