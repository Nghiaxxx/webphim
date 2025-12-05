import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getTranslation } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';
import { APP_CONFIG } from '../../constants/app';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  const [isOpen, setIsOpen] = useState(false);
  const [timeout, setTimeoutId] = useState(null);

  useEffect(() => {
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timeout]);

  const handleMouseEnter = () => {
    if (timeout) {
      clearTimeout(timeout);
      setTimeoutId(null);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    const timeoutId = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(timeoutId);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <Link 
        to="/login" 
        className="login-link"
      >
        <img src={APP_CONFIG.IMAGES.IC_HEADER_AUTH} alt="" />
        <span className="user-text">{t('header.login')}</span>
      </Link>
    );
  }

  return (
    <div 
      className="user-menu-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="user-menu-content">
        <img src={APP_CONFIG.IMAGES.IC_HEADER_AUTH} alt="" />
        <span className="user-text">
          {user.full_name ? user.full_name.toUpperCase().substring(0, 10) + '...' : user.email?.substring(0, 10) + '...'}
        </span>
      </div>
      {isOpen && (
        <>
          <div
            className="user-menu-bridge"
            onMouseEnter={handleMouseEnter}
          />
          <div 
            className="user-dropdown"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Link 
              to="/account/account-profile/" 
              className="user-dropdown-item-link"
            >
              <i className="fas fa-user user-dropdown-icon"></i>
              <span>Thông tin cá nhân</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="user-dropdown-item-button"
            >
              <i className="fas fa-sign-out-alt user-dropdown-icon"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserMenu;

