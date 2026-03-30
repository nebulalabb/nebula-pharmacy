import api from './api';

/**
 * Purchase Order (Stock In) Service
 */
export const purchaseService = {
  /**
   * Get list of purchase orders
   */
  getPurchaseOrders: async (params?: any) => {
    const response = await api.get('/purchase', { params });
    return response.data;
  },

  /**
   * Get purchase order detail by ID
   */
  getPurchaseOrderById: async (id: string) => {
    const response = await api.get(`/purchase/${id}`);
    return response.data;
  },

  /**
   * Create new purchase order and initialize batches
   */
  createPurchaseOrder: async (data: {
    supplierId: string;
    note?: string;
    totalAmount: number;
    items: Array<{
      productId: string;
      quantity: number;
      unitCost: number;
      lotNumber: string;
      manufacturingDate?: string;
      expiryDate: string;
    }>;
  }) => {
    const response = await api.post('/purchase', data);
    return response.data;
  }
};
