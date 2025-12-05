import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { APP_CONFIG } from '../../constants/app';

const MobileSidebar = ({ isOpen, onClose, cinemas }) => {
  const { language, changeLanguage } = useLanguage();
  const [isCinemaMenuOpen, setIsCinemaMenuOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose}></div>
      <div className="mobile-menu-sidebar">
        <div className="mobile-menu-header">
          <Link to="/" className="mobile-menu-logo" onClick={onClose}>
            <img 
              src={APP_CONFIG.IMAGES.LOGO} 
              alt="CINESTAR Logo" 
            />
          </Link>
          
          <div 
            className="mobile-menu-cinema-selector"
            onClick={() => setIsCinemaMenuOpen(!isCinemaMenuOpen)}
          >
            <span>Chọn Rạp</span>
            <i className="fas fa-chevron-down"></i>
          </div>

          <button 
            className="mobile-menu-close"
            onClick={onClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <Link to="/" className="mobile-menu-item" onClick={onClose}>
            TRANG CHỦ
          </Link>
          <Link to="/" className="mobile-menu-item" onClick={onClose}>
            ĐẶT VÉ
          </Link>
          <Link to="/popcorn-drink" className="mobile-menu-item" onClick={onClose}>
            BẮP NƯỚC
          </Link>
          <Link to="/showtimes" className="mobile-menu-item" onClick={onClose}>
            LỊCH CHIẾU
          </Link>
          <Link to="/" className="mobile-menu-item" onClick={onClose}>
            KHUYẾN MÃI
          </Link>
          <Link to="/" className="mobile-menu-item" onClick={onClose}>
            THÀNH VIÊN
          </Link>
        </nav>

        <div className="mobile-menu-divider"></div>

        <div className="mobile-menu-links">
          <Link to="/" className="mobile-menu-link" onClick={onClose}>
            Tổ chức sự kiện
          </Link>
          <Link to="/" className="mobile-menu-link" onClick={onClose}>
            Dịch vụ giải trí khác
          </Link>
          <Link to="/" className="mobile-menu-link" onClick={onClose}>
            Giới thiệu
          </Link>
          <Link to="/" className="mobile-menu-link" onClick={onClose}>
            Tuyển dụng
          </Link>
          <Link to="/" className="mobile-menu-link" onClick={onClose}>
            Liên hệ
          </Link>
        </div>

        <div className="mobile-menu-footer">
          <div className="mobile-menu-social">
            <span>Social:</span>
            <div className="mobile-social-icons">
              <a href="#" className="mobile-social-icon facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="mobile-social-icon zalo">
                <i className="fab fa-whatsapp"></i>
              </a>
              <a href="#" className="mobile-social-icon tiktok">
                <i className="fab fa-tiktok"></i>
              </a>
              <a href="#" className="mobile-social-icon youtube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div className="mobile-menu-language">
            <span>Ngôn ngữ:</span>
            <div 
              className="mobile-language-selector"
              onClick={() => {
                changeLanguage(language === 'vi' ? 'en' : 'vi');
              }}
            >
              <img 
                src={language === 'vi' 
                  ? APP_CONFIG.IMAGES.FOOTER_VIETNAM 
                  : APP_CONFIG.IMAGES.FOOTER_AMERICA
                } 
                alt={language === 'vi' ? 'VN' : 'ENG'} 
              />
              <span>{language === 'vi' ? 'VN' : 'ENG'}</span>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;

