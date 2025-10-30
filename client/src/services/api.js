import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }

      // Extract error message
      const message = error.response.data?.error ||
                     error.response.data?.message ||
                     'An error occurred';

      return Promise.reject({
        status: error.response.status,
        message,
        data: error.response.data
      });
    } else if (error.request) {
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection'
      });
    } else {
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred'
      });
    }
  }
);

// Authentication endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
  refreshToken: (token) => api.post('/auth/refresh-token', { token }),
};

// Track endpoints
export const trackAPI = {
  upload: (formData) => {
    return api.post('/tracks/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  get: (id) => api.get(`/tracks/${id}`),
  getUserTracks: (params) => api.get('/tracks/user', { params }),
  search: (params) => api.get('/tracks/search', { params }),
  getPopularRoutes: (limit = 10) => api.get(`/tracks/popular?limit=${limit}`),
  verify: (id) => api.post(`/tracks/${id}/verify`),
  delete: (id) => api.delete(`/tracks/${id}`),
  getStatistics: () => api.get('/tracks/statistics'),
};

// Hazard endpoints
export const hazardAPI = {
  create: (hazardData) => api.post('/hazards', hazardData),
  get: (id) => api.get(`/hazards/${id}`),
  search: (params) => api.get('/hazards/search', { params }),
  report: (id, reportData) => api.post(`/hazards/${id}/report`, reportData),
  verify: (id) => api.post(`/hazards/${id}/verify`),
  update: (id, updateData) => api.put(`/hazards/${id}`, updateData),
  delete: (id) => api.delete(`/hazards/${id}`),
  getNearby: (location, radius) => api.get('/hazards/nearby', {
    params: { lat: location[1], lng: location[0], radius }
  }),
  getStatistics: () => api.get('/hazards/statistics'),
};

// Route endpoints
export const routeAPI = {
  findOptimal: (startPoint, endPoint, preferences) =>
    api.post('/routes/optimal', { startPoint, endPoint, preferences }),
  getOfficial: () => api.get('/routes/official'),
  getSafetyHeatmap: (bounds) => api.get('/routes/heatmap', { params: bounds }),
  getNavigationWarnings: (bounds) => api.get('/routes/warnings', { params: bounds }),
  clusterTracks: (bounds, minSize) =>
    api.get('/routes/clusters', { params: { ...bounds, minSize } }),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (updateData) => api.put('/users/profile', updateData),
  getTopContributors: (limit = 10) => api.get(`/users/contributors?limit=${limit}`),
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
};

// Water level endpoints
export const waterAPI = {
  getCurrent: () => api.get('/water-levels/current'),
  getHistory: (days = 7) => api.get(`/water-levels/history?days=${days}`),
};

export default api;