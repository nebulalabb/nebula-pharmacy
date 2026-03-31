import api from './api';

/**
 * Business Intelligence & Reports Service
 */
export const reportsService = {
  /**
   * Get revenue chart data (grouped by day, week, or month)
   */
  getRevenueReport: async (params?: { from?: string; to?: string; groupBy?: 'day' | 'week' | 'month' }) => {
    const response = await api.get('/reports/revenue', { params });
    return response.data;
  },

  /**
   * Get profit estimation report
   */
  getProfitReport: async (params?: { from?: string; to?: string }) => {
    const response = await api.get('/reports/profit', { params });
    return response.data;
  },

  /**
   * Get top performing products leaderboard
   */
  getTopProducts: async (params?: { from?: string; to?: string; limit?: number; sortBy?: 'revenue' | 'quantity' }) => {
    const response = await api.get('/reports/top-products', { params });
    return response.data;
  },

  /**
   * Get inventory value and status report
   */
  getInventoryStatus: async () => {
    const response = await api.get('/reports/inventory-status');
    return response.data;
  },

  /**
   * Get unified dashboard stats (Today revenue, profit, orders, alerts)
   */
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  }
};
