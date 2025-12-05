import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTranslation } from '../../utils/translations';
import { useLanguage } from '../../contexts/LanguageContext';
import { createSlug } from '../../utils/helpers';

const CinemaMenu = ({ cinemas }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (key) => getTranslation(key, language);
  const [isOpen, setIsOpen] = useState(false);

  const handleCinemaClick = (cinema) => {
    const slug = createSlug(cinema.name);
    navigate(`/book-tickets/${slug}`);
    setIsOpen(false);
  };

  return (
    <div 
      className="cinema-menu-wrapper"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        className="nav-link-with-icon"
        onClick={() => navigate('/cinema-selection')}
      >
        <i className="fas fa-map-marker-alt nav-icon"></i>
        {t('header.selectCinema')}
      </button>
      {isOpen && (
        <div 
          className="cinema-dropdown"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {cinemas.length > 0 ? (
            <div className="cinema-dropdown-content">
              {cinemas.map((cinema) => (
                <div 
                  key={cinema.id} 
                  className="cinema-item"
                  onClick={() => handleCinemaClick(cinema)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="cinema-name">{cinema.name} ({cinema.city || ''})</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cinema-dropdown-content">
              <div className="cinema-item" style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
                {cinemas.length === 0 ? t('header.noCinemaData') : t('header.loadingCinemaData')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CinemaMenu;

