import axios from 'axios';

// Get API base URL from environment or default to localhost
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();
const API_URL_WITH_PATH = `${API_BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL_WITH_PATH,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getBaseUrl = () => API_BASE_URL;
export const getApiUrl = () => API_URL_WITH_PATH;

export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { username, password }),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
};

export const customersAPI = {
  list: (page = 1, limit = 10) => api.get(`/customers?page=${page}&limit=${limit}`),
  search: (query: string, field = 'name') =>
    api.get(`/customers/search?q=${query}&field=${field}`),
  inactive: (days = 15) => api.get(`/customers/inactive?days=${days}`),
  create: (data: any) => api.post('/customers', data),
  getById: (id: number) => api.get(`/customers/${id}`),
  update: (id: number, data: any) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const itemsAPI = {
  list: (page = 1, limit = 10) => api.get(`/items?page=${page}&limit=${limit}`),
  search: (query: string) => api.get(`/items/search?q=${query}`),
  create: (data: any) => api.post('/items', data),
  getById: (id: number) => api.get(`/items/${id}`),
  update: (id: number, data: any) => api.put(`/items/${id}`, data),
  delete: (id: number) => api.delete(`/items/${id}`),
};

export const paymentsAPI = {
  list: (page = 1, limit = 10) => api.get(`/payments?page=${page}&limit=${limit}`),
  search: (query: string) => api.get(`/payments/search?q=${query}`),
  create: (data: any) => api.post('/payments', data),
  approve: (id: number, data: any) => api.post(`/payments/${id}/approve`, data),
  reject: (id: number, data: any) => api.post(`/payments/${id}/reject`, data),
  getById: (id: number) => api.get(`/payments/${id}`),
};

export const creditsAPI = {
  list: (page = 1, limit = 10) => api.get(`/credits?page=${page}&limit=${limit}`),
  search: (query: string) => api.get(`/credits/search?q=${query}`),
  create: (data: any) => api.post('/credits', data),
  approve: (id: number, data: any) => api.post(`/credits/${id}/approve`, data),
  reject: (id: number, data: any) => api.post(`/credits/${id}/reject`, data),
};

export const refundsAPI = {
  list: (page = 1, limit = 10) => api.get(`/refunds?page=${page}&limit=${limit}`),
  search: (query: string) => api.get(`/refunds/search?q=${query}`),
  create: (data: any) => api.post('/refunds', data),
  approve: (id: number, data: any) => api.post(`/refunds/${id}/approve`, data),
};

export const dashboardAPI = {
  getAll: (period = 'month', startDate?: string, endDate?: string) => {
    let url = `/dashboard?period=${period}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return api.get(url);
  },
  getKPIs: () => api.get('/dashboard/kpis'),
};

export const uploadsAPI = {
  detectColumns: (file: File, dataType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataType', dataType);
    return api.post('/uploads/detect-columns', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  validate: (uploadId: number, columnMapping: any) =>
    api.post(`/uploads/${uploadId}/validate`, { columnMapping }),
  import: (uploadId: number, columnMapping: any, skipDuplicates = true) =>
    api.post(`/uploads/${uploadId}/import`, { columnMapping, skipDuplicates }),
};

export default api;
