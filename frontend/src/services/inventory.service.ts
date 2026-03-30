import api from './api';

/**
 * Inventory & Batch Management Service
 */
export const inventoryService = {
  /**
   * Get list of all inventory batches with filtering
   */
  getBatches: async (params?: {
    search?: string;
    isExpiring?: boolean;
    isLowStock?: boolean;
    productId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/inventory/batches', { params });
    return response.data;
  },

  /**
   * Get batches expiring within a specific number of days
   */
  getExpiringSoon: async (days: number = 30) => {
    const response = await api.get('/inventory/expiring-soon', { params: { days } });
    return response.data;
  },

  /**
   * Get list of inventory adjustments
   */
  getAdjustments: async (params?: any) => {
    const response = await api.get('/inventory/adjustments', { params });
    return response.data;
  },

  /**
   * Create a new inventory adjustment (Admin Only)
   */
  createAdjustment: async (data: {
    batchId: string;
    type: 'INCREASE' | 'DECREASE';
    quantity: number;
    reason: string;
  }) => {
    const response = await api.post('/inventory/adjustments', data);
    return response.data;
  }
};
