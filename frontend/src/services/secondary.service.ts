import api from './api';

/**
 * Suppliers Management Service
 */
export const suppliersService = {
  getSuppliers: async (params?: { search?: string; status?: string }) => {
    const response = await api.get('/suppliers', { params });
    return response.data;
  },
  getSupplierById: async (id: string) => {
    const response = await api.get(`/suppliers/${id}`);
    return response.data;
  },
  createSupplier: async (data: any) => {
    const response = await api.post('/suppliers', data);
    return response.data;
  },
  updateSupplier: async (id: string, data: any) => {
    const response = await api.patch(`/suppliers/${id}`, data);
    return response.data;
  },
  getPurchaseHistory: async (id: string) => {
    const response = await api.get(`/suppliers/${id}/purchase-history`);
    return response.data;
  }
};

/**
 * Medication Categories Service
 */
export const categoriesService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  createCategory: async (data: any) => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: any) => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  }
};

/**
 * User Management Service (Admin Staff Oversight)
 */
export const usersService = {
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  createUser: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  updateUser: async (id: string, data: any) => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },
  resetPassword: async (id: string, data: any) => {
    const response = await api.post(`/users/${id}/reset-password`, data);
    return response.data;
  }
};
