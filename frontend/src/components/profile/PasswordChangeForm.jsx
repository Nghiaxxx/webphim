import React from 'react';

const PasswordChangeForm = ({ 
  passwordData, 
  passwordLoading, 
  passwordError, 
  passwordSuccess, 
  onChange, 
  onSubmit 
}) => {
  return (
    <div className="profile-section">
      <h2 className="profile-section-title">Đổi mật khẩu</h2>
      
      {passwordError && (
        <div className="profile-error-message">
          {passwordError}
        </div>
      )}

      {passwordSuccess && (
        <div className="profile-success-message">
          {passwordSuccess}
        </div>
      )}

      <form onSubmit={onSubmit} className="profile-form">
        <div className="profile-form-group">
          <label htmlFor="old_password">Mật khẩu cũ *</label>
          <input
            type="password"
            id="old_password"
            name="old_password"
            value={passwordData.old_password}
            onChange={onChange}
            className="profile-input"
            required
          />
        </div>

        <div className="profile-form-group">
          <label htmlFor="new_password">Mật khẩu mới *</label>
          <input
            type="password"
            id="new_password"
            name="new_password"
            value={passwordData.new_password}
            onChange={onChange}
            className="profile-input"
            required
          />
        </div>

        <div className="profile-form-group">
          <label htmlFor="confirm_password">Xác thực mật khẩu *</label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            value={passwordData.confirm_password}
            onChange={onChange}
            className="profile-input"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={passwordLoading}
          className="profile-save-button"
        >
          {passwordLoading ? 'Đang đổi...' : 'ĐỔI MẬT KHẨU'}
        </button>
      </form>
    </div>
  );
};

export default PasswordChangeForm;

