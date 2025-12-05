import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../constants/app';

const PROFILE_ROUTES = {
  PROFILE: '/account/account-profile/',
  MEMBER: '/account/account-member/',
  HISTORY: '/account/account-history/',
};

const ProfileSidebar = ({ user, activeMenu, onLogout, loyaltyPoints, pointsPercentage }) => {
  return (
    <div className="profile-sidebar">
      <div className="profile-avatar-section">
        <div className="profile-avatar">
          <img src={APP_CONFIG.IMAGES.IC_HEADER_AUTH} alt="" />
        </div>
        <div className="profile-name-wrapper">
          <div className="profile-name">{user?.full_name || 'Người dùng'}</div>
          <a href="#" className="change-avatar-link">Thay đổi ảnh đại diện</a>
        </div>
      </div>

      <button className="cfriends-button">
        C'Friends
      </button>

      <div className="loyalty-points-section">
        <div className="loyalty-points-label">Tích điểm <span>C'Friends</span> </div>
        <div className="loyalty-progress-bar">
          <div 
            className="loyalty-progress-fill" 
            style={{ width: `${pointsPercentage}%` }}
          ></div>
        </div>
        <div className="loyalty-points-value">
          <span>{loyaltyPoints.toLocaleString()}</span>/10K
        </div>
      </div>

      <nav className="profile-nav">
        <Link 
          to={PROFILE_ROUTES.PROFILE} 
          className={`profile-nav-item ${activeMenu === 'customer-info' ? 'active' : ''}`}
        >
          <img src={APP_CONFIG.IMAGES.IC_USER_CIRCLE} alt="" />
          <span>Thông tin khách hàng</span>
        </Link>
        <Link 
          to={PROFILE_ROUTES.MEMBER} 
          className={`profile-nav-item ${activeMenu === 'member' ? 'active' : ''}`}
        >
          <img src={APP_CONFIG.IMAGES.IC_ACC_MENU_2} alt="" />
          <span>Thành viên Cinestar</span>
        </Link>
        <Link 
          to={PROFILE_ROUTES.HISTORY} 
          className={`profile-nav-item ${activeMenu === 'history' ? 'active' : ''}`}
        >
          <img src={APP_CONFIG.IMAGES.IC_ACC_MENU_3} alt="" />
          <span>Lịch sử mua hàng</span>
        </Link>
        <button onClick={onLogout} className="profile-nav-item logout-item">
          <i className="fas fa-sign-out-alt"></i>
          <span>Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
};

export default ProfileSidebar;

