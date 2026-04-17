import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API endpoints
export const visaAPI = {
  // Get visa requirements based on citizenship and destination
  getVisaRequirements: async (citizenship, destination) => {
    try {
      const response = await api.get('/visa-requirements', {
        params: { citizenship, destination }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create a new visa application
  createApplication: async (formData) => {
    try {
      const response = await api.post('/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Process payment
  createPaymentIntent: async (applicationId) => {
    try {
      const response = await api.post('/payments/create-intent', { applicationId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Admin API endpoints
export const adminAPI = {
  // Get all applications
  getAllApplications: async () => {
    try {
      const response = await api.get('/admin/applications');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all configurations
  getAllConfigurations: async () => {
    try {
      const response = await api.get('/admin/configurations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update configuration
  updateConfiguration: async (id, data) => {
    try {
      const response = await api.put(`/admin/configurations/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default api;
