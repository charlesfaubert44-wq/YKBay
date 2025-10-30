import api from './api';

const trackService = {
  // Upload new track
  uploadTrack: async (formData) => {
    try {
      const response = await api.post('/tracks/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Track upload failed' };
    }
  },

  // Get all tracks (with optional filters)
  getTracks: async (filters = {}) => {
    try {
      const response = await api.get('/tracks', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch tracks' };
    }
  },

  // Get track by ID
  getTrackById: async (trackId) => {
    try {
      const response = await api.get(`/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch track' };
    }
  },

  // Get user's tracks
  getUserTracks: async () => {
    try {
      const response = await api.get('/tracks/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user tracks' };
    }
  },

  // Get heatmap data
  getHeatmap: async () => {
    try {
      const response = await api.get('/tracks/heatmap');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch heatmap data' };
    }
  },

  // Update track
  updateTrack: async (trackId, updates) => {
    try {
      const response = await api.put(`/tracks/${trackId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update track' };
    }
  },

  // Delete track
  deleteTrack: async (trackId) => {
    try {
      const response = await api.delete(`/tracks/${trackId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete track' };
    }
  },

  // Get track statistics
  getTrackStats: async () => {
    try {
      const response = await api.get('/tracks/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch track stats' };
    }
  },
};

export default trackService;
