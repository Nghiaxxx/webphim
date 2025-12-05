import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { APP_CONFIG } from '../../constants/app';

const LanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();
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

  const handleLanguageChange = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
    if (timeout) {
      clearTimeout(timeout);
      setTimeoutId(null);
    }
  };

  return (
    <div 
      className="language-selector-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="language-selector">
        <div className="language-display-wrapper"> 
          <img 
            src={language === 'vi' 
              ? APP_CONFIG.IMAGES.FOOTER_VIETNAM 
              : APP_CONFIG.IMAGES.FOOTER_AMERICA
            } 
            alt={language === 'vi' ? 'VN' : 'ENG'} 
            className="language-flag"
          />
          <span>{language === 'vi' ? 'VN' : 'ENG'}</span>
          <i className="fas fa-chevron-down chevron"></i>
        </div>
      </div>

      {isOpen && (
        <div 
          className="language-dropdown"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className={`language-option ${language === 'vi' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('vi')}
          >
            <img 
              src={APP_CONFIG.IMAGES.FOOTER_VIETNAM}
              alt="VN"
              className="language-flag"
            />
            <span>VN</span>
          </div>
          <div 
            className={`language-option ${language === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            <img 
              src={APP_CONFIG.IMAGES.FOOTER_AMERICA}
              alt="ENG"
              className="language-flag"
            />
            <span>ENG</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

