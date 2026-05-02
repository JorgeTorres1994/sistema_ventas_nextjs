import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
});

// Helper to ensure role is a string and handle object structure safely
const sanitizeUser = (user: any) => {
  if (!user) return user;
  const sanitized = { ...user };
  
  // Handle role as string and extract name if object
  if (typeof user.role === 'object' && user.role !== null) {
    sanitized.role = user.role.name || 'Usuario';
    
    // Flatten permissions if they exist in the role object
    if (user.role.permissions && Array.isArray(user.role.permissions)) {
      sanitized.permissions = user.role.permissions.map((p: any) => p.permission?.name || p.permissionId);
    }
  }
  
  return sanitized;
};

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
    const sanitizedUser = sanitizeUser(response.data.user);
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(sanitizedUser));
  }
  return response.data;
};

export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data: { email: string; code: string; newPassword: string }) => {
  const response = await api.post('/auth/reset-password', data);
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

export const getProducts = async (params: { page?: number; limit?: number; search?: string; categoryId?: string } = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSale = async (
  items: { productId: string; quantity: number }[],
  paymentMethod: string,
  amountPaid: number,
  documentType: string = 'BOLETA',
  customerId?: string,
  couponCode?: string,
  pointsToRedeem: number = 0
) => {
  try {
    const response = await api.post('/sales', {
      items,
      paymentMethod,
      amountPaid,
      documentType,
      customerId,
      couponCode,
      pointsToRedeem
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
  invoiceStatus?: string;
  documentType?: string;
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

// ── Users Management ────────────────────────────────────────────────────────
export const getUsers = async (params?: { search?: string; role?: string; roleId?: string; isActive?: boolean }) => {
  const response = await api.get('/users', { params });
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: any) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const toggleUserStatus = async (id: string) => {
  const response = await api.patch(`/users/${id}/status`);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me');
  console.log('DEBUG USER DATA:', response.data);
  const sanitized = sanitizeUser(response.data);
  localStorage.setItem('user', JSON.stringify(sanitized));
  return sanitized;
};

export const updateMyProfile = async (data: any) => {
  const response = await api.put('/users/me', data);
  return sanitizeUser(response.data);
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/users/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// ── Roles & Permissions ──────────────────────────────────────────────────
export const getRoles = async () => {
  const response = await api.get('/roles');
  return response.data;
};

export const getRoleById = async (id: string) => {
  const response = await api.get(`/roles/${id}`);
  return response.data;
};

export const createRole = async (data: { name: string; description?: string; permissionIds: string[] }) => {
  const response = await api.post('/roles', data);
  return response.data;
};

export const updateRole = async (id: string, data: { name?: string; description?: string; permissionIds?: string[] }) => {
  const response = await api.patch(`/roles/${id}`, data);
  return response.data;
};

export const deleteRole = async (id: string) => {
  const response = await api.delete(`/roles/${id}`);
  return response.data;
};

export const getPermissions = async () => {
  const response = await api.get('/roles/permissions');
  return response.data;
};

// ── Document Series (Billing) ──────────────────────────────────────────
export const getDocumentSeries = async () => {
  const response = await api.get('/document-series');
  return response.data;
};

export const createDocumentSeries = async (data: any) => {
  const response = await api.post('/document-series', data);
  return response.data;
};

export const updateDocumentSeries = async (id: string, data: any) => {
  const response = await api.patch(`/document-series/${id}`, data);
  return response.data;
};

// ── Expenses & Outflows ────────────────────────────────────────────────
export const getExpenses = async (params?: { startDate?: string; endDate?: string; categoryId?: string }) => {
  const response = await api.get('/expenses', { params });
  return response.data;
};

export const getExpenseCategories = async () => {
  const response = await api.get('/expenses/categories');
  return response.data;
};

export const createExpense = async (data: any) => {
  const response = await api.post('/expenses', data);
  return response.data;
};

export const updateExpense = async (id: string, data: any) => {
  const response = await api.patch(`/expenses/${id}`, data);
  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);
  return response.data;
};

export const createExpenseCategory = async (data: any) => {
  const response = await api.post('/expenses/categories', data);
  return response.data;
};

export const updateExpenseCategory = async (id: string, data: any) => {
  const response = await api.patch(`/expenses/categories/${id}`, data);
  return response.data;
};

export const deleteExpenseCategory = async (id: string) => {
  const response = await api.delete(`/expenses/categories/${id}`);
  return response.data;
};

// ── Credits & Debts (Accounts Receivable/Payable) ──────────────────
export const getReceivables = async (params?: { status?: string; customerId?: string; search?: string }) => {
  const response = await api.get('/credits/receivables', { params });
  return response.data;
};

export const getPayables = async (params?: { status?: string; supplierId?: string; search?: string }) => {
  const response = await api.get('/credits/payables', { params });
  return response.data;
};

export const recordCreditPayment = async (data: {
  amount: number;
  paymentMethod: string;
  notes?: string;
  creditSaleId?: string;
  creditPurchaseId?: string;
  cashRegisterId?: string;
}) => {
  const response = await api.post('/credits/payments', data);
  return response.data;
};

// ── Inventory & Kardex ────────────────────────────────────────────────
export const getKardex = async (productId: string, params?: { startDate?: string; endDate?: string }) => {
  const response = await api.get(`/inventory/kardex/${productId}`, { params });
  return response.data;
};

// ── Promotions & Loyalty ──────────────────────────────────────────
export const validateCoupon = async (code: string, amount: number) => {
  const response = await api.get('/promotions/coupons/validate', { params: { code, amount } });
  return response.data;
};

export const getCustomerPoints = async (customerId: string) => {
  const response = await api.get(`/promotions/loyalty/${customerId}`);
  return response.data;
};

// --- Invoicing ---
export const reSendInvoice = async (saleId: string) => {
  const response = await api.post(`/invoicing/send/${saleId}`);
  return response.data;
};

// ── Quotations ──────────────────────────────────────────────────────────
export const getQuotations = async (params: any) => {
  const response = await api.get('/quotations', { params });
  return response.data;
};

export const getQuotationById = async (id: string) => {
  const response = await api.get(`/quotations/${id}`);
  return response.data;
};

export const createQuotation = async (data: any) => {
  const response = await api.post('/quotations', data);
  return response.data;
};

export const updateQuotationStatus = async (id: string, status: string) => {
  const response = await api.patch(`/quotations/${id}/status`, { status });
  return response.data;
};

export const convertQuotationToSale = async (id: string, paymentMethod: string = 'CASH') => {
  const response = await api.post(`/quotations/${id}/convert`, { paymentMethod });
  return response.data;
};

export { api };
export default api;
