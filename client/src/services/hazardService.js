import api from './api';

const hazardService = {
  // Get all hazards
  getHazards: async () => {
    try {
      const response = await api.get('/hazards');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch hazards' };
    }
  },

  // Report new hazard
  reportHazard: async (hazardData) => {
    try {
      const response = await api.post('/hazards', hazardData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to report hazard' };
    }
  },

  // Update hazard
  updateHazard: async (hazardId, updates) => {
    try {
      const response = await api.put(`/hazards/${hazardId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update hazard' };
    }
  },

  // Delete hazard
  deleteHazard: async (hazardId) => {
    try {
      const response = await api.delete(`/hazards/${hazardId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete hazard' };
    }
  },

  // Verify hazard (upvote)
  verifyHazard: async (hazardId) => {
    try {
      const response = await api.post(`/hazards/${hazardId}/verify`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to verify hazard' };
    }
  },
};

export default hazardService;
