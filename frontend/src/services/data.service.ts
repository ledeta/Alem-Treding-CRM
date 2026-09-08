/**
 * UNIFIED DATA SERVICE - Handles both real API calls and mock data fallback
 * Provides calculated, formatted data for all pages
 */

import { apiClient } from '@/lib/api-client';
import {
  MOCK_CUSTOMERS,
  MOCK_ITEMS,
  MOCK_TRANSACTIONS,
  MOCK_PAYMENTS,
  MOCK_CREDITS,
  MOCK_REFUNDS,
  MOCK_NO_VISITS,
  MOCK_APPROVALS,
  getDashboardKPIs,
} from '@/lib/mock-data';

// ============ CUSTOMERS SERVICE ============
export const customersService = {
  async getAll(page = 1, limit = 50) {
    try {
      const response = await apiClient.get(
        `/customers?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      return {
        data: MOCK_CUSTOMERS,
        total: MOCK_CUSTOMERS.length,
        page,
        limit,
      };
    }
  },

  async getById(id: number) {
    try {
      return await apiClient.get(`/customers/${id}`);
    } catch (error) {
      return MOCK_CUSTOMERS.find((c) => c.id === id);
    }
  },

  async search(query: string) {
    try {
      return await apiClient.get(`/customers/search?q=${query}`);
    } catch (error) {
      const lowerQuery = query.toLowerCase();
      return MOCK_CUSTOMERS.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.phone.includes(query) ||
          c.customerIdRef.includes(query)
      );
    }
  },

  async getWithCalculations() {
    const customers = await this.getAll(1, 999);
    const data = Array.isArray(customers) ? customers : customers.data || [];

    return data.map((customer: any) => ({
      ...customer,
      daysActive: Math.floor(
        (Date.now() - new Date(customer.createdAt).getTime()) / 86400000
      ),
      lastVisitDays: Math.floor(
        (Date.now() - new Date(customer.lastTransactionDate).getTime()) / 86400000
      ),
    }));
  },
};

// ============ ITEMS SERVICE ============
export const itemsService = {
  async getAll(page = 1, limit = 50) {
    try {
      return await apiClient.get(`/items?page=${page}&limit=${limit}`);
    } catch (error) {
      return {
        data: MOCK_ITEMS,
        total: MOCK_ITEMS.length,
        page,
        limit,
      };
    }
  },

  async getById(id: number) {
    try {
      return await apiClient.get(`/items/${id}`);
    } catch (error) {
      return MOCK_ITEMS.find((i) => i.id === id);
    }
  },

  async getLowStock() {
    const items = await this.getAll(1, 999);
    const data = Array.isArray(items) ? items : items.data || [];
    return data.filter((item: any) => item.stock <= item.reorderLevel);
  },

  async getWithCalculations() {
    const items = await this.getAll(1, 999);
    const data = Array.isArray(items) ? items : items.data || [];

    return data.map((item: any) => ({
      ...item,
      profit: item.price - item.costPrice,
      profitMargin: item.price > 0 ? Math.round(((item.price - item.costPrice) / item.price) * 100) : 0,
      totalStockValue: item.price * item.stock,
      reorderDays: item.stock > 0 ? Math.ceil((item.stock / (item.unitsSold || 1)) * 30) : 0,
    }));
  },
};

// ============ TRANSACTIONS SERVICE ============
export const transactionsService = {
  async getAll(page = 1, limit = 50) {
    try {
      return await apiClient.get(`/transactions?page=${page}&limit=${limit}`);
    } catch (error) {
      return {
        data: MOCK_TRANSACTIONS,
        total: MOCK_TRANSACTIONS.length,
        page,
        limit,
      };
    }
  },

  async getById(id: number) {
    try {
      return await apiClient.get(`/transactions/${id}`);
    } catch (error) {
      return MOCK_TRANSACTIONS.find((t) => t.id === id);
    }
  },

  async getByCustomerId(customerId: number) {
    try {
      // Call the backend API endpoint directly
      const response = await apiClient.get(`/transactions/by-customer/${customerId}`);
      // Return the data array or full response if it has a data property
      return Array.isArray(response) ? response : (response.data || response);
    } catch (error) {
      console.error('Error fetching customer transactions:', error);
      // Fallback: no mock data, return empty array so real data is used when available
      return [];
    }
  },

  async calculateTotals() {
    const transactions = await this.getAll(1, 999);
    const data = Array.isArray(transactions) ? transactions : transactions.data || [];

    const completed = data.filter((t: any) => t.status === 'Completed');
    const pending = data.filter((t: any) => t.status === 'Pending');

    return {
      totalTransactions: data.length,
      completedTransactions: completed.length,
      pendingTransactions: pending.length,
      totalRevenue: completed.reduce((sum: number, t: any) => sum + (t.totalAmount || 0), 0),
      pendingAmount: pending.reduce((sum: number, t: any) => sum + (t.totalAmount || 0), 0),
      averageTransaction: data.length > 0 ? data.reduce((sum: number, t: any) => sum + (t.totalAmount || 0), 0) / data.length : 0,
    };
  },

  async getByDateRange(startDate: Date, endDate: Date) {
    const transactions = await this.getAll(1, 999);
    const data = Array.isArray(transactions) ? transactions : transactions.data || [];
    const start = startDate.getTime();
    const end = endDate.getTime();

    return data.filter((t: any) => {
      const time = new Date(t.date).getTime();
      return time >= start && time <= end;
    });
  },
};

// ============ PAYMENTS SERVICE ============
export const paymentsService = {
  async getAll(page = 1, limit = 50) {
    try {
      return await apiClient.get(`/payments?page=${page}&limit=${limit}`);
    } catch (error) {
      return {
        data: MOCK_PAYMENTS,
        total: MOCK_PAYMENTS.length,
        page,
        limit,
      };
    }
  },

  async getById(id: number) {
    try {
      return await apiClient.get(`/payments/${id}`);
    } catch (error) {
      return MOCK_PAYMENTS.find((p) => p.id === id);
    }
  },

  async getByStatus(status: string) {
    const payments = await this.getAll(1, 999);
    const data = Array.isArray(payments) ? payments : payments.data || [];
    return data.filter((p: any) => p.status === status);
  },

  async calculateTotals() {
    const payments = await this.getAll(1, 999);
    const data = Array.isArray(payments) ? payments : payments.data || [];

    return {
      totalPayments: data.length,
      pendingPayments: data.filter((p: any) => p.status === 'Pending').length,
      overduePayments: data.filter((p: any) => p.status === 'Overdue').length,
      totalAmount: data.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
      pendingAmount: data
        .filter((p: any) => p.status === 'Pending' || p.status === 'Overdue')
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    };
  },
};

// ============ CREDITS SERVICE ============
export const creditsService = {
  async getAll(page = 1, limit = 50) {
    try {
      return await apiClient.get(`/credits?page=${page}&limit=${limit}`);
    } catch (error) {
      return {
        data: MOCK_CREDITS,
        total: MOCK_CREDITS.length,
        page,
        limit,
      };
    }
  },

  async getById(id: number) {
    try {
      return await apiClient.get(`/credits/${id}`);
    } catch (error) {
      return MOCK_CREDITS.find((c) => c.id === id);
    }
  },

  async calculateTotals() {
    const credits = await this.getAll(1, 999);
    const data = Array.isArray(credits) ? credits : credits.data || [];

    return {
      totalCredits: data.length,
      totalCreditAmount: data.reduce((sum: number, c: any) => sum + (c.amount || 0), 0),
      totalUsedAmount: data.reduce((sum: number, c: any) => sum + (c.usedAmount || 0), 0),
      totalAvailableAmount: data.reduce((sum: number, c: any) => sum + (c.remainingAmount || 0), 0),
      avgUtilizationRate:
        data.length > 0 ? Math.round(data.reduce((sum: number, c: any) => sum + (c.utilizationRate || 0), 0) / data.length) : 0,
    };
  },
};

// ============ REFUNDS SERVICE ============
export const refundsService = {
  async getAll(page = 1, limit = 50) {
    try {
      return await apiClient.get(`/refunds?page=${page}&limit=${limit}`);
    } catch (error) {
      return {
        data: MOCK_REFUNDS,
        total: MOCK_REFUNDS.length,
        page,
        limit,
      };
    }
  },

  async getById(id: number) {
    try {
      return await apiClient.get(`/refunds/${id}`);
    } catch (error) {
      return MOCK_REFUNDS.find((r) => r.id === id);
    }
  },

  async getByStatus(status: string) {
    const refunds = await this.getAll(1, 999);
    const data = Array.isArray(refunds) ? refunds : refunds.data || [];
    return data.filter((r: any) => r.status === status);
  },

  async calculateTotals() {
    const refunds = await this.getAll(1, 999);
    const data = Array.isArray(refunds) ? refunds : refunds.data || [];

    return {
      totalRefunds: data.length,
      pendingRefunds: data.filter((r: any) => r.status === 'Pending').length,
      approvedRefunds: data.filter((r: any) => r.status === 'Approved').length,
      completedRefunds: data.filter((r: any) => r.status === 'Completed').length,
      totalRefundAmount: data.reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
      pendingRefundAmount: data
        .filter((r: any) => r.status === 'Pending' || r.status === 'Approved')
        .reduce((sum: number, r: any) => sum + (r.amount || 0), 0),
    };
  },
};

// ============ APPROVALS SERVICE ============
export const approvalsService = {
  async getAll(page = 1, limit = 50) {
    try {
      return await apiClient.get(`/approvals?page=${page}&limit=${limit}`);
    } catch (error) {
      return {
        data: MOCK_APPROVALS,
        total: MOCK_APPROVALS.length,
        page,
        limit,
      };
    }
  },

  async getById(id: number) {
    try {
      return await apiClient.get(`/approvals/${id}`);
    } catch (error) {
      return MOCK_APPROVALS.find((a) => a.id === id);
    }
  },

  async getPending() {
    const approvals = await this.getAll(1, 999);
    const data = Array.isArray(approvals) ? approvals : approvals.data || [];
    return data.filter((a: any) => a.status === 'Pending');
  },

  async approve(id: number) {
    try {
      return await apiClient.patch(`/approvals/${id}/approve`);
    } catch (error) {
      console.error('Error approving:', error);
      throw error;
    }
  },

  async reject(id: number, reason: string) {
    try {
      return await apiClient.patch(`/approvals/${id}/reject`, { reason });
    } catch (error) {
      console.error('Error rejecting:', error);
      throw error;
    }
  },
};

// ============ NO VISITS SERVICE ============
export const noVisitsService = {
  async getInactiveCustomers(daysThreshold = 15) {
    try {
      return await apiClient.get(`/customers/inactive?days=${daysThreshold}`);
    } catch (error) {
      return MOCK_NO_VISITS.filter((c: any) => c.daysWithoutVisit >= daysThreshold);
    }
  },
};

// ============ DASHBOARD SERVICE ============
export const dashboardService = {
  async getKPIs() {
    try {
      return await apiClient.get('/analytics/kpis');
    } catch (error) {
      return getDashboardKPIs();
    }
  },

  async getSummary() {
    const kpis = await this.getKPIs();
    return {
      ...kpis,
      lastUpdated: new Date().toISOString(),
    };
  },
};

// ============ HELPER FUNCTIONS ============
export const formatCurrency = (amount: number, currency = 'ብር') => {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} ${currency}`;
};

export const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysAgo = (date: string | Date | null | undefined) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'N/A';
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

export const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
};
