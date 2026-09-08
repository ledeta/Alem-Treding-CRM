import { apiClient } from '../lib/api-client';
import type {
  AuthUser,
  LoginResponse,
  Customer,
  Item,
  PaymentRequest,
  CreditRequest,
  RefundRequest,
  DashboardKPIs,
  Notification,
  ChatMessage,
  PaginatedResponse,
} from '../types';

// Auth API
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<LoginResponse>('/auth/login', { username, password }),
  
  verify: () =>
    apiClient.post<{ valid: boolean; user: AuthUser }>('/auth/verify'),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  refreshToken: () =>
    apiClient.post<{ accessToken: string }>('/auth/refresh'),
};

// Dashboard API
export const dashboardApi = {
  getStatistics: () =>
    apiClient.get<DashboardKPIs>('/dashboard/statistics'),
  
  getSalesChart: (period: 'week' | 'month' | 'year') =>
    apiClient.get(`/dashboard/sales-chart?period=${period}`),
  
  getTopCustomers: (limit = 5) =>
    apiClient.get(`/dashboard/top-customers?limit=${limit}`),
  
  getTopItems: (limit = 5) =>
    apiClient.get(`/dashboard/top-items?limit=${limit}`),
  
  getRecentTransactions: (limit = 10) =>
    apiClient.get(`/dashboard/recent-transactions?limit=${limit}`),
};

// Customer API
export const customerApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
    apiClient.get<PaginatedResponse<Customer>>('/customers', { params }),
  
  getById: (id: number) =>
    apiClient.get<Customer>(`/customers/${id}`),
  
  create: (data: Partial<Customer>) =>
    apiClient.post<Customer>('/customers', data),
  
  update: (id: number, data: Partial<Customer>) =>
    apiClient.put<Customer>(`/customers/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/customers/${id}`),
  
  getBalance: (id: number) =>
    apiClient.get(`/customers/${id}/balance`),
  
  getTransactions: (id: number, params?: { page?: number; limit?: number }) =>
    apiClient.get(`/customers/${id}/transactions`, { params }),
  
  search: (query: string) =>
    apiClient.get<Customer[]>(`/customers/search?q=${query}`),
  
  getNoVisits: (days: number) =>
    apiClient.get<Customer[]>(`/customers/no-visits?days=${days}`),
};

// Item API
export const itemApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; category?: string; isActive?: boolean }) =>
    apiClient.get<PaginatedResponse<Item>>('/items', { params }),
  
  getById: (id: number) =>
    apiClient.get<Item>(`/items/${id}`),
  
  create: (data: Partial<Item>) =>
    apiClient.post<Item>('/items', data),
  
  update: (id: number, data: Partial<Item>) =>
    apiClient.put<Item>(`/items/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/items/${id}`),
  
  getStock: (id: number) =>
    apiClient.get(`/items/${id}/stock`),
  
  updateStock: (id: number, quantity: number, operation: 'add' | 'subtract' | 'set') =>
    apiClient.post(`/items/${id}/stock`, { quantity, operation }),
  
  search: (query: string) =>
    apiClient.get<Item[]>(`/items/search?q=${query}`),
  
  getLowStock: (threshold?: number) =>
    apiClient.get<Item[]>(`/items/low-stock${threshold ? `?threshold=${threshold}` : ''}`),
  
  getCategories: () =>
    apiClient.get<string[]>('/items/categories'),
};

// Payment Request API
export const paymentRequestApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; customerId?: number }) =>
    apiClient.get<PaginatedResponse<PaymentRequest>>('/payment-requests', { params }),
  
  getById: (id: number) =>
    apiClient.get<PaymentRequest>(`/payment-requests/${id}`),
  
  create: (data: Partial<PaymentRequest>) =>
    apiClient.post<PaymentRequest>('/payment-requests', data),
  
  approve: (id: number, notes?: string) =>
    apiClient.post(`/payment-requests/${id}/approve`, { notes }),
  
  reject: (id: number, notes: string) =>
    apiClient.post(`/payment-requests/${id}/reject`, { notes }),
  
  getPending: () =>
    apiClient.get<PaymentRequest[]>('/payment-requests/pending'),
};

// Credit Request API
export const creditRequestApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; customerId?: number }) =>
    apiClient.get<PaginatedResponse<CreditRequest>>('/credit-requests', { params }),
  
  getById: (id: number) =>
    apiClient.get<CreditRequest>(`/credit-requests/${id}`),
  
  create: (data: Partial<CreditRequest>) =>
    apiClient.post<CreditRequest>('/credit-requests', data),
  
  approve: (id: number, approvedAmount: number, expiryDate?: Date) =>
    apiClient.post(`/credit-requests/${id}/approve`, { approvedAmount, expiryDate }),
  
  reject: (id: number, reason: string) =>
    apiClient.post(`/credit-requests/${id}/reject`, { reason }),
  
  getPending: () =>
    apiClient.get<CreditRequest[]>('/credit-requests/pending'),
  
  getByCustomer: (customerId: number) =>
    apiClient.get<CreditRequest[]>(`/credit-requests/customer/${customerId}`),
};

// Refund Request API
export const refundRequestApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; customerId?: number }) =>
    apiClient.get<PaginatedResponse<RefundRequest>>('/refund-requests', { params }),
  
  getById: (id: number) =>
    apiClient.get<RefundRequest>(`/refund-requests/${id}`),
  
  create: (data: Partial<RefundRequest>) =>
    apiClient.post<RefundRequest>('/refund-requests', data),
  
  approve: (id: number) =>
    apiClient.post(`/refund-requests/${id}/approve`),
  
  reject: (id: number, reason: string) =>
    apiClient.post(`/refund-requests/${id}/reject`, { reason }),
  
  complete: (id: number) =>
    apiClient.post(`/refund-requests/${id}/complete`),
  
  getPending: () =>
    apiClient.get<RefundRequest[]>('/refund-requests/pending'),
};

// Transaction API
export const transactionApi = {
  getAll: (params?: { page?: number; limit?: number; customerId?: number; startDate?: string; endDate?: string }) =>
    apiClient.get('/transactions', { params }),
  
  getById: (id: number) =>
    apiClient.get(`/transactions/${id}`),
  
  create: (data: any) =>
    apiClient.post('/transactions', data),
  
  update: (id: number, data: any) =>
    apiClient.put(`/transactions/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/transactions/${id}`),
  
  getStats: (period: 'today' | 'week' | 'month' | 'year') =>
    apiClient.get(`/transactions/stats?period=${period}`),
};

// User API
export const userApi = {
  getAll: (params?: { page?: number; limit?: number; role?: string; status?: string }) =>
    apiClient.get<PaginatedResponse<AuthUser>>('/users', { params }),
  
  getById: (id: number) =>
    apiClient.get<AuthUser>(`/users/${id}`),
  
  create: (data: Partial<AuthUser> & { password: string }) =>
    apiClient.post<AuthUser>('/users', data),
  
  update: (id: number, data: Partial<AuthUser>) =>
    apiClient.put<AuthUser>(`/users/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),
  
  changePassword: (id: number, currentPassword: string, newPassword: string) =>
    apiClient.post(`/users/${id}/change-password`, { currentPassword, newPassword }),
  
  updateStatus: (id: number, status: string) =>
    apiClient.patch(`/users/${id}/status`, { status }),
};

// Notification API
export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications', { params }),
  
  markAsRead: (id: number) =>
    apiClient.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    apiClient.post('/notifications/read-all'),
  
  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/notifications/unread-count'),
  
  delete: (id: number) =>
    apiClient.delete(`/notifications/${id}`),
};

// Upload API
export const uploadApi = {
  uploadFile: (file: File, type: 'customers' | 'items' | 'transactions') =>
    {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return apiClient.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  
  getUploads: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get('/uploads', { params }),
  
  getUploadStatus: (id: number) =>
    apiClient.get(`/uploads/${id}`),
  
  retryUpload: (id: number) =>
    apiClient.post(`/uploads/${id}/retry`),
  
  deleteUpload: (id: number) =>
    apiClient.delete(`/uploads/${id}`),
};

// Chat API
export const chatApi = {
  getConversations: () =>
    apiClient.get('/chat/conversations'),
  
  getMessages: (conversationId: string, params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<ChatMessage>>(`/chat/conversations/${conversationId}/messages`, { params }),
  
  sendMessage: (conversationId: string, message: string) =>
    apiClient.post<ChatMessage>(`/chat/conversations/${conversationId}/messages`, { message }),
  
  markAsRead: (conversationId: string, messageId: number) =>
    apiClient.patch(`/chat/conversations/${conversationId}/messages/${messageId}/read`),
  
  searchConversations: (query: string) =>
    apiClient.get(`/chat/search?q=${query}`),
};

// Audit API
export const auditApi = {
  getLogs: (params?: { page?: number; limit?: number; userId?: number; action?: string; startDate?: string; endDate?: string }) =>
    apiClient.get('/audit/logs', { params }),
  
  getByEntity: (entityType: string, entityId: number) =>
    apiClient.get(`/audit/entity/${entityType}/${entityId}`),
  
  exportLogs: (params?: { startDate?: string; endDate?: string; format?: 'csv' | 'xlsx' }) =>
    apiClient.get('/audit/export', { params, responseType: 'blob' as any }),
};

// Analytics API
export const analyticsApi = {
  getSalesAnalytics: (params: { startDate: string; endDate: string; groupBy?: 'day' | 'week' | 'month' }) =>
    apiClient.get('/analytics/sales', { params }),
  
  getCustomerAnalytics: (params: { startDate: string; endDate: string }) =>
    apiClient.get('/analytics/customers', { params }),
  
  getItemAnalytics: (params: { startDate: string; endDate: string; limit?: number }) =>
    apiClient.get('/analytics/items', { params }),
  
  getRevenueAnalytics: (params: { startDate: string; endDate: string; groupBy?: 'day' | 'week' | 'month' }) =>
    apiClient.get('/analytics/revenue', { params }),
  
  getProfitAnalytics: (params: { startDate: string; endDate: string }) =>
    apiClient.get('/analytics/profit', { params }),
};

// Search API
export const searchApi = {
  global: (query: string) =>
    apiClient.get(`/search?q=${query}`),
  
  customers: (query: string) =>
    apiClient.get<Customer[]>(`/search/customers?q=${query}`),
  
  items: (query: string) =>
    apiClient.get<Item[]>(`/search/items?q=${query}`),
  
  transactions: (query: string) =>
    apiClient.get(`/search/transactions?q=${query}`),
};

export default {
  auth: authApi,
  dashboard: dashboardApi,
  customers: customerApi,
  items: itemApi,
  paymentRequests: paymentRequestApi,
  creditRequests: creditRequestApi,
  refundRequests: refundRequestApi,
  transactions: transactionApi,
  users: userApi,
  notifications: notificationApi,
  uploads: uploadApi,
  chat: chatApi,
  audit: auditApi,
  analytics: analyticsApi,
  search: searchApi,
};
