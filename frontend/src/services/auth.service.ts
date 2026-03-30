import api from './api';

/**
 * Authentication Service
 */
export const authService = {
  /**
   * Login with email and password
   */
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    return response.data; // Expected { success: true, data: { user, token } }
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: any) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  }
};
