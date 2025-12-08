import { APP_CONFIG } from '../constants/app';
import { getToken } from '../utils/token';

// Helper function để gọi API
async function apiRequest(endpoint, options = {}) {
  const url = `${APP_CONFIG.API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Thêm token nếu có
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Support AbortController signal if provided
  // Note: signal is already in options if passed, fetch will handle it

  try {
    const response = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      // Check if response is empty
      if (!text || text.trim() === '') {
        // Return empty array for GET requests, empty object for others
        return response.method === 'GET' ? [] : {};
      }
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', text);
        throw new Error('Server trả về dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
      }
    } else {
      // If not JSON, try to get text
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server trả về dữ liệu không hợp lệ. Vui lòng kiểm tra lại.');
    }

    if (!response.ok) {
      // Create error with data attached for error responses
      const error = new Error(data.error || data.message || 'Có lỗi xảy ra');
      error.status = response.status;
      error.data = data; // Attach full response data
      throw error;
    }

    return data;
  } catch (error) {
    // Don't throw error if request was aborted
    if (error.name === 'AbortError') {
      throw error;
    }
    // If it's already our custom error with data, keep it
    if (error.data) {
      throw error;
    }
    // If it's already our custom error, throw it
    if (error.message && !error.message.includes('JSON')) {
      throw error;
    }
    // Otherwise, wrap it
    throw new Error(error.message || 'Có lỗi xảy ra khi kết nối server');
  }
}

// Auth API
export const authAPI = {
  // Đăng ký
  register: async (userData) => {
    return apiRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Đăng nhập
  login: async (credentials) => {
    return apiRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Lấy profile
  getProfile: async () => {
    return apiRequest('/users/profile', {
      method: 'GET',
    });
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Đổi password
  changePassword: async (oldPassword, newPassword) => {
    return apiRequest('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  },

  // Đăng xuất
  logout: async () => {
    return apiRequest('/users/logout', {
      method: 'POST',
    });
  },
};

// Public API (for client-side use)
export const publicAPI = {
  // Movies
  movies: {
    getAll: (status, signal, search) => {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      const query = params.toString();
      const endpoint = query ? `/movies?${query}` : '/movies';
      return apiRequest(endpoint, signal ? { signal } : {});
    },
    getById: (id, signal) => apiRequest(`/movies/${id}`, signal ? { signal } : {}),
  },

  // Promotions
  promotions: {
    getAll: (signal) => apiRequest('/promotions', signal ? { signal } : {}),
    getBySlug: (slug, signal) => apiRequest(`/promotions/${slug}`, signal ? { signal } : {}),
  },

  // Showtimes
  showtimes: {
    getAll: (movieId, signal) => {
      const endpoint = movieId ? `/showtimes?movieId=${movieId}` : '/showtimes';
      return apiRequest(endpoint, signal ? { signal } : {});
    },
  },

  // Cinemas
  cinemas: {
    getAll: (signal, search) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const query = params.toString();
      const endpoint = query ? `/cinemas?${query}` : '/cinemas';
      return apiRequest(endpoint, signal ? { signal } : {});
    },
    getById: (id, signal) => apiRequest(`/cinemas/${id}`, signal ? { signal } : {}),
  },

  // Rooms
  rooms: {
    getAll: () => apiRequest('/rooms'),
    getById: (id) => apiRequest(`/rooms/${id}`),
    getLayout: (id) => apiRequest(`/rooms/${id}/layout`),
  },

  // Bookings
  bookings: {
    getSeats: (showtimeId) => apiRequest(`/bookings/${showtimeId}/seats`),
    create: (data) => apiRequest('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    lockSeats: (showtimeId, seats, sessionId) => apiRequest(`/bookings/${showtimeId}/lock-seats`, {
      method: 'POST',
      body: JSON.stringify({ seats, sessionId })
    }),
    unlockSeats: (showtimeId, seats, sessionId) => apiRequest(`/bookings/${showtimeId}/unlock-seats`, {
      method: 'DELETE',
      body: JSON.stringify({ seats, sessionId })
    }),
    getLockedSeats: async (showtimeId) => {
      try {
        return await apiRequest(`/bookings/${showtimeId}/locked-seats`);
      } catch (error) {
        // Nếu lỗi hoặc empty, trả về mảng rỗng
        console.warn('Error getting locked seats, returning empty array:', error);
        return [];
      }
    },
  },

  // Products
  products: {
    getAll: (type) => {
      const endpoint = type ? `/products?type=${type}` : '/products';
      return apiRequest(endpoint);
    },
    getById: (id) => apiRequest(`/products/${id}`),
  },
};

// Admin API
export const adminAPI = {
  // Movies
  movies: {
    getAll: () => apiRequest('/movies'),
    getById: (id) => apiRequest(`/movies/${id}`),
    create: (data) => apiRequest('/movies', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/movies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/movies/${id}`, { method: 'DELETE' }),
  },

  // Showtimes
  showtimes: {
    getAll: (movieId, roomId) => {
      const params = new URLSearchParams();
      if (movieId) params.append('movieId', movieId);
      if (roomId) params.append('roomId', roomId);
      const query = params.toString();
      return apiRequest(query ? `/showtimes?${query}` : '/showtimes');
    },
    create: (data) => apiRequest('/showtimes', { method: 'POST', body: JSON.stringify(data) }),
    createMultiple: (showtimes) => apiRequest('/showtimes/batch', { method: 'POST', body: JSON.stringify({ showtimes }) }),
    update: (id, data) => apiRequest(`/showtimes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/showtimes/${id}`, { method: 'DELETE' }),
  },

  // Promotions
  promotions: {
    getAll: () => apiRequest('/promotions'),
    getBySlug: (slug) => apiRequest(`/promotions/${slug}`),
    create: (data) => apiRequest('/promotions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/promotions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/promotions/${id}`, { method: 'DELETE' }),
  },

  // Cinemas
  cinemas: {
    getAll: () => apiRequest('/cinemas'),
    getById: (id) => apiRequest(`/cinemas/${id}`),
    getWithDetails: (id) => apiRequest(`/cinemas/${id}/details`),
    create: (data) => apiRequest('/cinemas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/cinemas/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/cinemas/${id}`, { method: 'DELETE' }),
  },

  // Products
  products: {
    getAll: (type) => apiRequest(type ? `/products?type=${type}` : '/products'),
    getById: (id) => apiRequest(`/products/${id}`),
    create: (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
  },

  // Users
  users: {
    getAll: () => apiRequest('/users'),
    getById: (id) => apiRequest(`/users/${id}`),
    update: (id, data) => apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/users/${id}`, { method: 'DELETE' }),
  },

  // Bookings
  bookings: {
    getAll: () => apiRequest('/bookings'),
    getById: (id) => apiRequest(`/bookings/${id}`),
    update: (id, data) => apiRequest(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/bookings/${id}`, { method: 'DELETE' }),
  },

  // Rooms
  rooms: {
    getAll: (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.cinema_id) queryParams.append('cinema_id', params.cinema_id);
      const query = queryParams.toString();
      return apiRequest(query ? `/rooms?${query}` : '/rooms');
    },
    getById: (id) => apiRequest(`/rooms/${id}`),
    getLayout: (id) => apiRequest(`/rooms/${id}/layout`),
    getByCinema: (cinemaId) => apiRequest(`/rooms/cinema/${cinemaId}`),
    create: (data) => apiRequest('/rooms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/rooms/${id}`, { method: 'DELETE' }),
  },

  // Settings
  settings: {
    get: () => apiRequest('/admin/settings'),
    update: (data) => apiRequest('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
};

export default apiRequest;

