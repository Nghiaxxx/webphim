/**
 * Token management utilities
 * Centralized token handling to avoid direct localStorage access
 */

const TOKEN_KEY = 'token';

/**
 * Get token from localStorage
 * @returns {string|null} Token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set token to localStorage
 * @param {string} token - Token to store
 */
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    removeToken();
  }
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if token exists
 * @returns {boolean} True if token exists
 */
export const hasToken = () => {
  return !!getToken();
};

