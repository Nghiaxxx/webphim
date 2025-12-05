import { vi } from '../translations/vi';
import { en } from '../translations/en';

const translations = {
  vi,
  en,
};

export const getTranslation = (key, language = 'vi') => {
  // Kiểm tra xem language có tồn tại không
  if (!translations[language]) {
    console.warn(`Language '${language}' not found, falling back to 'vi'`);
    language = 'vi';
  }
  
  const translationObj = translations[language];
  
  // Trực tiếp truy cập key vì các keys trong object là phẳng (như 'header.login')
  if (translationObj && translationObj[key]) {
    return translationObj[key];
  }
  
  // Nếu không tìm thấy, thử fallback sang 'vi'
  if (language !== 'vi' && translations.vi && translations.vi[key]) {
    return translations.vi[key];
  }
  
  // Nếu vẫn không tìm thấy, trả về key
  console.warn(`Translation key '${key}' not found for language '${language}'`);
  return key;
};

export default translations;
