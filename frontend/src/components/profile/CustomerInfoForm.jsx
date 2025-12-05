import React from 'react';
import { formatDateForInput } from '../../utils/helpers';

const CustomerInfoForm = ({ 
  formData, 
  loading, 
  error, 
  success, 
  onChange, 
  onSubmit 
}) => {
  return (
    <>
      <h1 className="profile-title">THÔNG TIN KHÁCH HÀNG</h1>

      <div className="profile-section">
        <h2 className="profile-section-title">Thông tin cá nhân</h2>
        
        {error && (
          <div className="profile-error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-success-message">
            {success}
          </div>
        )}

        <form onSubmit={onSubmit} className="profile-form">
          <div className="profile-form-grid">
            <div className="profile-form-group">
              <label htmlFor="full_name">Họ và tên</label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={onChange}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="phone">Số điện thoại</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onChange}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="date_of_birth">Ngày sinh</label>
              <div className="profile-date-input-wrapper">
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formatDateForInput(formData.date_of_birth)}
                  onChange={onChange}
                  className="profile-input profile-date-input"
                />
              </div>
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="profile-input profile-input-disabled"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="profile-save-button"
          >
            {loading ? 'Đang lưu...' : 'LƯU THÔNG TIN'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CustomerInfoForm;

