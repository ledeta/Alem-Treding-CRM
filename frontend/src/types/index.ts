// Authentication
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: {
    id: number;
    name: 'admin' | 'sales_user';
  };
  status: 'Active' | 'Suspended' | 'Released' | 'Terminated' | 'Deleted';
  lastLogin?: Date;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// Customers
export interface Customer {
  id: number;
  name: string;
  customerIdRef?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  balance?: CustomerBalance;
  lastTransactionDate?: Date;
  createdAt: Date;
}

export interface CustomerBalance {
  id: number;
  customerId: number;
  balance: number;
  creditAmount: number;
  refundAmount: number;
}

// Items
export interface Item {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  category?: string;
  purchasePrice: number;
  sellingPrice: number;
  isActive: boolean;
  stock?: Stock;
  createdAt: Date;
}

export interface Stock {
  id: number;
  itemId: number;
  quantity: number;
  lowStockThreshold: number;
  lastUpdated: Date;
}

// Payments
export interface PaymentRequest {
  id: number;
  customer: Customer;
  amount: number;
  bank: string;
  reason: string;
  requestDate: Date;
  requestTime: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdBy: AuthUser;
  approvedBy?: AuthUser;
  approvalDate?: Date;
  notes?: string;
  createdAt: Date;
}

// Credits
export interface CreditRequest {
  id: number;
  customer: Customer;
  requestedAmount: number;
  approvedAmount?: number;
  reason: string;
  description?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  expiryDate?: Date;
  usedAmount: number;
  createdBy: AuthUser;
  approvedBy?: AuthUser;
  createdAt: Date;
}

// Refunds
export interface RefundRequest {
  id: number;
  customer: Customer;
  item: Item;
  quantity: number;
  refundAmount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  createdBy: AuthUser;
  approvedBy?: AuthUser;
  createdAt: Date;
}

// Dashboard KPIs
export interface DashboardKPIs {
  totalCustomers: number;
  newCustomers: number;
  totalSales: number;
  totalAssets: number;
  netProfit: number;
  pendingPayments: number;
  outstandingCredits: number;
  pendingRefunds: number;
  averageTransactionValue: number;
  retentionRate: number;
  paymentSuccessRate: number;
}

export interface ChartData {
  label: string;
  value: number;
  percentage: number;
}

// Chat
export interface ChatMessage {
  id: number;
  conversationId: string;
  sender: {
    id: number;
    name: string;
  };
  message: string;
  messageType: 'text' | 'file' | 'system';
  createdAt: Date;
  isRead: boolean;
}

// Notifications
export interface Notification {
  id: number;
  userId: number;
  type: 'upload' | 'payment_request' | 'approval' | 'refund_request' | 'credit_request' | 'system';
  title: string;
  message: string;
  relatedId?: number;
  relatedType?: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

// Common Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
