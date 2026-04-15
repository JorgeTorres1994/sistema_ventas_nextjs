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

// --- Customer Management ---

export const getCustomers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
} = {}) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const getCustomerById = async (id: string) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: {
  name: string;
  dni: string;
  email?: string;
  phone?: string;
  address?: string;
}) => {
  const response = await api.post('/customers', data);
  return response.data;
};

export const updateCustomer = async (id: string, data: any) => {
  const response = await api.patch(`/customers/${id}`, data);
  return response.data;
};

export const toggleCustomerStatus = async (id: string) => {
  const response = await api.patch(`/customers/${id}/status`);
  return response.data;
};

// --- Supplier Management ---

export const getSuppliers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
} = {}) => {
  const response = await api.get('/suppliers', { params });
  return response.data;
};

export const getSupplierById = async (id: string) => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

export const createSupplier = async (data: {
  name: string;
  dniRuc: string;
  email?: string;
  phone?: string;
  address?: string;
}) => {
  const response = await api.post('/suppliers', data);
  return response.data;
};

export const updateSupplier = async (id: string, data: any) => {
  const response = await api.patch(`/suppliers/${id}`, data);
  return response.data;
};

export const toggleSupplierStatus = async (id: string) => {
  const response = await api.patch(`/suppliers/${id}/status`);
  return response.data;
};

// --- Purchase Management ---

export const getPurchases = async (params: {
    page?: number;
    limit?: number;
    status?: string;
    supplierId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
} = {}) => {
  const response = await api.get('/purchases', { params });
  return response.data;
};

export const getPurchaseById = async (id: string) => {
  const response = await api.get(`/purchases/${id}`);
  return response.data;
};

export const createPurchase = async (data: {
  supplierId: string;
  items: { productId: string; quantity: number; costPrice: number }[];
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  expectedDelivery?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  total: number;
}) => {
  const response = await api.post('/purchases', data);
  return response.data;
};

// ── Cash Register ──────────────────────────────────────────────────────────────
export const getCashStatus = async () => {
  const response = await api.get('/cash');
  return response.data;
};

export const openCash = async (data: { openingBalance: number; notes?: string }) => {
  const response = await api.post('/cash/open', data);
  return response.data;
};

export const closeCash = async (data: { closingBalance: number; notes?: string }) => {
  const response = await api.post('/cash/close', data);
  return response.data;
};

export const getCashMovements = async () => {
  const response = await api.get('/cash/movements');
  return response.data;
};

export const createCashMovement = async (data: { type: 'IN' | 'OUT'; amount: number; description: string }) => {
  const response = await api.post('/cash/movements', data);
  return response.data;
};

// ── Reports ──────────────────────────────────────────────────────────────────
export const getReportsSummary = async (params: any) => {
  const response = await api.get('/reports/summary', { params });
  return response.data;
};

export const getReportsCharts = async (params: any) => {
  const response = await api.get('/reports/charts', { params });
  return response.data;
};

export const getReportsTopProducts = async (params: any) => {
  const response = await api.get('/reports/top-products', { params });
  return response.data;
};

export const getReportsTransactions = async (params: any) => {
  const response = await api.get('/reports/transactions', { params });
  return response.data;
};

// ── Settings ────────────────────────────────────────────────────────────────
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateSettings = async (data: any) => {
  const response = await api.put('/settings', data);
  return response.data;
};

export const getPaymentMethods = async () => {
  const response = await api.get('/settings/payment-methods');
  return response.data;
};

export const togglePaymentMethod = async (id: string) => {
  const response = await api.patch(`/settings/payment-methods/${id}/toggle`);
  return response.data;
};

export const uploadSettingsLogo = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/settings/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
