/**
 * Utility helper functions
 */

/**
 * Create slug from string (Vietnamese support)
 * @param {string} name - String to convert to slug
 * @returns {string} Slug string
 */
export const createSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Format date for display (DD/MM/YYYY with day name)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatReleaseDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName}, ${day}/${month}/${date.getFullYear()}`;
  } catch (error) {
    return dateString;
  }
};

/**
 * Format date for display (DD/MM/YYYY)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
};

/**
 * Format date for input (YYYY-MM-DD)
 * @param {string} dateString - Date string
 * @returns {string} Formatted date string for input
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  // If already in YYYY-MM-DD format, return as is
  if (dateString.includes('-') && dateString.length === 10) {
    return dateString;
  }
  // If in DD/MM/YYYY format, convert
  if (dateString.includes('/')) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }
  return dateString;
};

/**
 * Format timer seconds to MM:SS
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
export const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube URL
 * @returns {string|null} YouTube video ID or null
 */
export const extractYouTubeId = (url) => {
  if (!url) return null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  return match && match[1].length === 11 ? match[1] : null;
};

/**
 * Get age rating details for display
 * @param {string} ratingCode - Rating code (P, C, T13, T16, T18, K)
 * @returns {object} Object with description and cssClass
 */
export const getAgeRatingDetails = (ratingCode) => {
  if (!ratingCode) return { description: '', cssClass: 'rating-default' };

  // Normalize rating code
  const code = ratingCode.trim().toUpperCase();

  const ratingMap = {
    'P': { description: 'dành cho mọi lứa tuổi', cssClass: 'rating-p' },
    'C': { description: 'được phép xem theo độ tuổi được cấp phép', cssClass: 'rating-c' },
    'T13': { description: 'dành cho khán giả từ đủ 13 tuổi trở lên (13+)', cssClass: 'rating-t13' },
    'T16': { description: 'dành cho khán giả từ đủ 16 tuổi trở lên', cssClass: 'rating-t16' },
    'T18': { description: 'dành cho khán giả từ đủ 18 tuổi trở lên', cssClass: 'rating-t18' },
    'K': { description: 'dành cho khán giả từ dưới 13 tuổi với điều kiện xem cùng cha, mẹ hoặc người giám hộ', cssClass: 'rating-k' },
  };

  return ratingMap[code] || { description: 'Không xác định', cssClass: 'rating-default' };
};

/**
 * Format currency (Vietnamese Dong)
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

/**
 * Format currency with VNĐ suffix
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string with VNĐ
 */
export const formatCurrencyVND = (amount) => {
  return `${formatCurrency(amount)} VNĐ`;
};

/**
 * Get unique dates from showtimes array
 * @param {Array} showtimes - Array of showtime objects
 * @returns {Array} Array of unique date objects
 */
export const getAvailableDates = (showtimes) => {
  const dates = new Set();
  showtimes.forEach(st => {
    const date = new Date(st.start_time);
    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dayName = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][date.getDay()];
    dates.add({ dateStr, dayName, fullDate: date });
  });
  return Array.from(dates).sort((a, b) => a.fullDate - b.fullDate);
};

/**
 * Get unique cities from cinemas array
 * @param {Array} cinemas - Array of cinema objects
 * @returns {Array} Array of unique city strings
 */
export const getAvailableCities = (cinemas) => {
  const cities = new Set();
  cinemas.forEach(cinema => {
    if (cinema.city) {
      cities.add(cinema.city);
    }
  });
  return Array.from(cities).sort();
};

/**
 * Format time from date string (HH:MM)
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
};

