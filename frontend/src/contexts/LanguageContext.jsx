import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Lấy ngôn ngữ từ localStorage hoặc mặc định là 'vi'
    try {
      const savedLang = localStorage.getItem('language');
      return savedLang === 'en' ? 'en' : 'vi'; // Chỉ chấp nhận 'vi' hoặc 'en'
    } catch (error) {
      console.error('Error reading language from localStorage:', error);
      return 'vi'; // Mặc định là 'vi'
    }
  });

  useEffect(() => {
    // Lưu ngôn ngữ vào localStorage khi thay đổi
    localStorage.setItem('language', language);
    // Cập nhật lang attribute của HTML
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'vi' ? 'en' : 'vi');
  }, []);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    language,
    toggleLanguage,
    changeLanguage,
  }), [language, toggleLanguage, changeLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
