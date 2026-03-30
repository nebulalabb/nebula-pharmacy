import api from './api';

/**
 * Reports and Dashboard Service
 */
export const reportsService = {
  /**
   * Get unified dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  /**
   * Get revenue report by date range
   */
  getRevenueReport: async (from?: string, to?: string) => {
    const response = await api.get('/reports/revenue', { params: { from, to } });
    return response.data;
  },

  /**
   * Get profit report by date range
   */
  getProfitReport: async (from?: string, to?: string) => {
    const response = await api.get('/reports/profit', { params: { from, to } });
    return response.data;
  },

  /**
   * Get top products report
   */
  getTopProducts: async (limit: number = 10) => {
    const response = await api.get('/reports/top-products', { params: { limit } });
    return response.data;
  },

  /**
   * Get total inventory value
   */
  getInventoryValue: async () => {
    const response = await api.get('/reports/inventory-value');
    return response.data;
  }
};
