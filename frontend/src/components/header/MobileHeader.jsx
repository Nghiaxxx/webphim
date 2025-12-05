import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../constants/app';

const MobileHeader = ({ cinemas, onMenuToggle, isMenuOpen }) => {
  const [isCinemaMenuOpen, setIsCinemaMenuOpen] = useState(false);

  return (
    <>
      <header className="mobile-header">
        <Link to="/" className="mobile-logo-link">
          <img 
            src={APP_CONFIG.IMAGES.LOGO} 
            alt="CINESTAR Logo" 
            className="mobile-logo-image" 
          />
        </Link>
        
        <div 
          className="mobile-cinema-selector"
          onClick={() => setIsCinemaMenuOpen(!isCinemaMenuOpen)}
        >
          <span>Chọn Rạp</span>
          <i className="fas fa-chevron-down"></i>
          {isCinemaMenuOpen && (
            <div className="mobile-cinema-dropdown">
              {cinemas.length > 0 ? (
                cinemas.map((cinema) => (
                  <div key={cinema.id} className="mobile-cinema-item">
                    {cinema.name} ({cinema.address || ''})
                  </div>
                ))
              ) : (
                <div className="mobile-cinema-item">Không có dữ liệu</div>
              )}
            </div>
          )}
        </div>

        <button 
          className="mobile-menu-toggle"
          onClick={onMenuToggle}
        >
          <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </button>
      </header>
    </>
  );
};

export default MobileHeader;

