import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/admin/AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const { login, logout, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Kiểm tra nếu đã đăng nhập và là admin, chuyển đến dashboard
  // Hoặc nếu đã đăng nhập nhưng không phải admin, hiển thị lỗi
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        setError('Bạn không có quyền truy cập trang quản trị');
        logout();
      }
    }
  }, [user, navigate, logout]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Đợi AuthContext cập nhật user state
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Kiểm tra role - ProtectedRoute cũng sẽ kiểm tra, nhưng kiểm tra ở đây để hiển thị lỗi sớm
        // Nếu không phải admin, ProtectedRoute sẽ redirect, nhưng ta vẫn hiển thị lỗi ở đây
        // Để user biết tại sao không thể truy cập
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <h1 className="admin-login-title">Đăng Nhập Admin</h1>
            <p className="admin-login-subtitle">Quản trị hệ thống</p>
          </div>

          {error && (
            <div className="admin-login-error">
              {error}
            </div>
          )}

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email của bạn"
                required
                autoComplete="email"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="admin-password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="admin-login-submit-btn"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="admin-login-footer">
            <a href="/" className="admin-login-back-link">
              <i className="fas fa-arrow-left"></i> Quay về trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

