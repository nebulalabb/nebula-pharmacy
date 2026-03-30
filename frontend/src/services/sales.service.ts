import api from './api';

/**
 * Sales (POS) Transaction Service
 */
export const salesService = {
  /**
   * Get list of sales transactions
   */
  getSales: async (params?: any) => {
    const response = await api.get('/sales', { params });
    return response.data;
  },

  /**
   * Get sale transaction detail by ID
   */
  getSaleById: async (id: string) => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  /**
   * Create new sale transaction (Backend handles FEFO batch deduction)
   */
  createSale: async (data: {
    items: Array<{ productId: string; quantity: number }>;
    totalAmount: number;
    discount?: number;
    paymentMethod: 'CASH' | 'TRANSFER';
    receivedAmount?: number;
    changeAmount?: number;
    customerName?: string;
    customerPhone?: string;
  }) => {
    const response = await api.post('/sales', data);
    return response.data;
  }
};
