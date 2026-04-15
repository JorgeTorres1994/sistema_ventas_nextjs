import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3005',
});

// Assuming no authentication is strictly needed for the isolated endpoint locally,
// but adding interceptors just in case you add auth tokens later.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getDashboardData = async () => {
  try {
    const response = await api.get('/reports/dashboard');
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const getProducts = async (page = 1, limit = 50, search = '') => {
  try {
    const response = await api.get('/products', {
      params: { page, limit, search }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSale = async (
  items: { productId: string; quantity: number }[],
  paymentMethod: string,
  amountPaid: number
) => {
  try {
    const response = await api.post('/sales', {
      items,
      paymentMethod,
      amountPaid
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSales = async (filters: {
  startDate?: string;
  endDate?: string;
  status?: string;
  search?: string;
} = {}) => {
  try {
    const response = await api.get('/sales', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSaleById = async (id: string) => {
  try {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelSale = async (id: string) => {
  try {
    const response = await api.patch(`/sales/${id}/cancel`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Product Management ---

export const getApiProducts = async (filters: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
} = {}) => {
  try {
    const response = await api.get('/products', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductById = async (id: string) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (data: any) => {
  try {
    const response = await api.post('/products', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id: string, data: any) => {
  try {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleProductStatus = async (id: string) => {
  try {
    const response = await api.patch(`/products/${id}/toggle`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadProductImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// --- Inventory Management ---

export const getInventoryStock = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  stockStatus?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) => {
  const response = await api.get('/inventory', { params });
  return response.data;
};

export const getInventoryMovements = async (params: {
  page?: number;
  limit?: number;
  productId?: string;
  type?: string;
  reason?: string;
  startDate?: string;
  endDate?: string;
} = {}) => {
  const response = await api.get('/inventory/movements', { params });
  return response.data;
};

export const adjustInventoryStock = async (data: {
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT';
  reason?: string;
  note?: string;
}) => {
  const response = await api.post('/inventory/adjust', data);
  return response.data;
};

export default api;
