import api from './api';

/**
 * Product Management Service
 */
export const productsService = {
  /**
   * Get list of products with search, filter and pagination
   */
  getProducts: async (params?: any) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Get product detail by ID
   */
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Get product by barcode
   */
  getProductByBarcode: async (barcode: string) => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  /**
   * Create new product (Admin only)
   */
  createProduct: async (data: any) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  /**
   * Update existing product (Admin only)
   */
  updateProduct: async (id: string, data: any) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product (Admin only)
   */
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
