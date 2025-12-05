import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { APP_CONFIG } from '../constants/app';
import ProfileSidebar from '../components/profile/ProfileSidebar';
import CustomerInfoForm from '../components/profile/CustomerInfoForm';
import PasswordChangeForm from '../components/profile/PasswordChangeForm';
import MemberProgram from '../components/profile/MemberProgram';
import PurchaseHistory from '../components/profile/PurchaseHistory';
import TicketModal from '../components/profile/TicketModal';

// Route constants - dễ maintain và thay đổi
const PROFILE_ROUTES = {
  PROFILE: '/account/account-profile/',
  MEMBER: '/account/account-member/',
  HISTORY: '/account/account-history/',
};

// Helper function để map URL path to active menu
const getActiveMenuFromPath = (pathname) => {
  if (pathname.includes('account-profile')) return 'customer-info';
  if (pathname.includes('account-member')) return 'member';
  if (pathname.includes('account-history')) return 'history';
  return 'customer-info'; // default
};

function Profile() {
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Xác định activeMenu dựa trên URL - sử dụng useMemo để tối ưu
  const activeMenu = useMemo(() => {
    return getActiveMenuFromPath(location.pathname);
  }, [location.pathname]);

  // Xử lý redirect và validation
  useEffect(() => {
    const path = location.pathname;
    
    // Redirect /profile to default account page
    if (path === '/profile') {
      navigate(PROFILE_ROUTES.PROFILE, { replace: true });
      return;
    }

    // Normalize URL - đảm bảo có trailing slash
    const normalizedPath = path.endsWith('/') ? path : path + '/';
    const expectedPaths = Object.values(PROFILE_ROUTES);
    
    if (expectedPaths.includes(normalizedPath) && path !== normalizedPath) {
      navigate(normalizedPath, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Cập nhật thông tin thành công!');
      } else {
        setError(result.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Mật khẩu mới và xác thực mật khẩu không khớp');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await changePassword(passwordData.old_password, passwordData.new_password);
      if (result.success) {
        setPasswordSuccess('Đổi mật khẩu thành công!');
        setPasswordData({
          old_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        setPasswordError(result.error || 'Đổi mật khẩu thất bại');
      }
    } catch (err) {
      setPasswordError(err.message || 'Có lỗi xảy ra');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleViewTicket = (orderId) => {
    // Sample ticket data - replace with actual data from API later
    const ticketData = {
      orderId: orderId,
      movieName: "TỬ CHIẾN TRÊN KHÔNG (T16)",
      bookingId: "139463699",
      time: "23:55 21/09/2025",
      screenRoom: "03",
      numberOfTickets: "2",
      ticketType: "Người Lớn",
      seatNumber: "LO2L01",
      cinema: "Cinestar Hai Bà Trưng (TP.HCM)",
      address: "135 Hai Bà Trưng, Phường Sài Gòn, Thành phố Hồ Chí Minh",
      total: "98,000"
    };
    setSelectedTicket(ticketData);
    setIsTicketModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  // Calculate loyalty points
  const loyaltyPoints = user?.loyalty_points || APP_CONFIG.MEMBER.DEFAULT_POINTS;
  const maxPoints = APP_CONFIG.MEMBER.MAX_POINTS;
  const pointsPercentage = (loyaltyPoints / maxPoints) * 100;

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="app-root">
      <Header />
      <main className="profile-main">
        {/* Mobile Profile Header */}
        <div className="profile-mobile-header">
          <div className="profile-mobile-avatar">
            <img src={APP_CONFIG.IMAGES.IC_HEADER_AUTH} alt="" />
          </div>
          <div className="profile-mobile-name">{user.full_name || 'Người dùng'}</div>
          <a href="#" className="profile-mobile-change-avatar">Thay đổi ảnh đại diện</a>
          <button className="profile-mobile-cfriends-button">C'Friends</button>
          <div className="profile-mobile-points">
            <div className="profile-mobile-points-label">Tích điểm C'Friends</div>
            <div className="profile-mobile-progress-bar">
              <div 
                className="profile-mobile-progress-fill" 
                style={{ width: `${pointsPercentage}%` }}
              ></div>
            </div>
            <div className="profile-mobile-points-value">{loyaltyPoints.toLocaleString()}/10K</div>
          </div>
        </div>

        {/* Mobile Horizontal Tabs - chỉ hiển thị trên mobile */}
        <div className="profile-mobile-tabs">
          <Link 
            to={PROFILE_ROUTES.PROFILE} 
            className={`profile-mobile-tab ${activeMenu === 'customer-info' ? 'active' : ''}`}
          >
            Thông tin khách hàng
          </Link>
          <Link 
            to={PROFILE_ROUTES.MEMBER} 
            className={`profile-mobile-tab ${activeMenu === 'member' ? 'active' : ''}`}
          >
            Thành viên Cinestar
          </Link>
          <Link 
            to={PROFILE_ROUTES.HISTORY} 
            className={`profile-mobile-tab ${activeMenu === 'history' ? 'active' : ''}`}
          >
            Lịch sử
          </Link>
        </div>

        <div className="profile-container">
          <ProfileSidebar 
            user={user}
            activeMenu={activeMenu}
            onLogout={handleLogout}
            loyaltyPoints={loyaltyPoints}
            pointsPercentage={pointsPercentage}
          />

          {/* Right Main Content */}
          <div className="profile-content">
            {activeMenu === 'customer-info' && (
              <>
                <CustomerInfoForm
                  formData={formData}
                  loading={loading}
                  error={error}
                  success={success}
                  onChange={handleChange}
                  onSubmit={handleSubmit}
                />
                <PasswordChangeForm
                  passwordData={passwordData}
                  passwordLoading={passwordLoading}
                  passwordError={passwordError}
                  passwordSuccess={passwordSuccess}
                  onChange={handlePasswordChange}
                  onSubmit={handlePasswordSubmit}
                />
              </>
            )}

            {activeMenu === 'member' && (
              <MemberProgram 
                loyaltyPoints={loyaltyPoints}
                pointsPercentage={pointsPercentage}
              />
            )}

            {activeMenu === 'history' && (
              <PurchaseHistory onViewTicket={handleViewTicket} />
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <Link to="/" className="mobile-bottom-nav-item">
          <i className="fas fa-film"></i>
          <span>Lịch chiếu</span>
        </Link>
        <Link to="/popcorn-drink" className="mobile-bottom-nav-item">
          <i className="fas fa-cookie-bite"></i>
          <span>Bắp nước</span>
        </Link>
        <Link to="/" className="mobile-bottom-nav-item">
          <i className="fas fa-ticket-alt"></i>
          <span>Đặt vé</span>
        </Link>
        <Link to="/" className="mobile-bottom-nav-item">
          <i className="fas fa-gift"></i>
          <span>Khuyến mãi</span>
        </Link>
        <Link to={PROFILE_ROUTES.PROFILE} className="mobile-bottom-nav-item active">
          <i className="fas fa-user"></i>
          <span>Tài khoản</span>
        </Link>
      </nav>

      <TicketModal 
        isOpen={isTicketModalOpen}
        ticket={selectedTicket}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default Profile;
