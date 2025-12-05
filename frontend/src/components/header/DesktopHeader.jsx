import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getTranslation } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';
import { APP_CONFIG } from '../../constants/app';
import LanguageSelector from './LanguageSelector';
import UserMenu from './UserMenu';
import CinemaMenu from './CinemaMenu';

const DesktopHeader = ({ cinemas }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  const [searchQuery, setSearchQuery] = useState('');
  
  const isPopcornDrinkPage = location.pathname === '/popcorn-drink';

  // Sync search input with URL params when on search page
  useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const keyword = params.get('keyword') || '';
      setSearchQuery(keyword);
    }
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <>
      <header className="main-header">
        <div className="header-content-container"> 
          <Link to="/" className="main-logo-link">
            <img 
              src={APP_CONFIG.IMAGES.LOGO} 
              alt="CINESTAR Logo" 
              className="main-logo-image" 
            />
          </Link>

          <div className="header-actions">
            <button 
              className="btn-ticket"
              onClick={() => navigate('/movie')}
            >
              <img src={APP_CONFIG.IMAGES.IC_TICKET} alt="" />
              {t('header.bookTicket')}
            </button>
            <button 
              className={`btn-popcorn ${isPopcornDrinkPage ? 'active' : ''}`}
              onClick={() => navigate('/popcorn-drink')}
            >
              <img src={APP_CONFIG.IMAGES.IC_COR} alt="" />
              {t('header.bookSnack')}
            </button>
          </div>
          
          <div className="header-search">
            <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', position: 'relative' }}>
              <input 
                type="text" 
                placeholder={t('header.search.placeholder')} 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <button 
                type="submit"
                style={{ 
                  position: 'absolute', 
                  right: '14px', 
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  zIndex: 1,
                  width: 'auto',
                  height: 'auto'
                }}
              >
                <i className="fas fa-search" style={{ fontSize: '16px', color: '#6b7280' }}></i>
              </button>
            </form>
          </div>
          
          <div className="header-user">
            <UserMenu />
            <LanguageSelector />
          </div>
        </div> 
      </header>
      <nav className="secondary-nav">
        <div className="secondary-nav-left">
          <CinemaMenu cinemas={cinemas} />
          <button 
            className="nav-link-with-icon"
            onClick={() => navigate('/showtimes')}
          >
            <i className="fas fa-clock nav-icon"></i>
            {t('header.showtimes')}
          </button>
        </div>
      </nav>
    </>
  );
};

export default DesktopHeader;

