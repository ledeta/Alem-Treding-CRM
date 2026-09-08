/**
 * AGGRESSIVE MOCK DATA FOR ALL PAGES - ENHANCED WITH CALCULATIONS
 * This ensures the app works offline with the backend unavailable
 */

export const MOCK_CUSTOMERS = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    customerIdRef: 'CUST001',
    phone: '+251911234567',
    email: 'ahmed@example.com',
    city: 'Addis Ababa',
    balance: { balance: 50000, creditAmount: 10000 },
    isActive: true,
    lastTransactionDate: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 30*86400000).toISOString(),
    totalPurchased: 85000,
    totalCreditUsed: 7000,
  },
  {
    id: 2,
    name: 'Fatima Mohammed',
    customerIdRef: 'CUST002',
    phone: '+251922345678',
    email: 'fatima@example.com',
    city: 'Dire Dawa',
    balance: { balance: 75000, creditAmount: 15000 },
    isActive: true,
    lastTransactionDate: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 60*86400000).toISOString(),
    totalPurchased: 62500,
    totalCreditUsed: 8000,
  },
  {
    id: 3,
    name: 'Mohamed Ali',
    customerIdRef: 'CUST003',
    phone: '+251933456789',
    email: 'mohamed@example.com',
    city: 'Harar',
    balance: { balance: 120000, creditAmount: 25000 },
    isActive: true,
    lastTransactionDate: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 90*86400000).toISOString(),
    totalPurchased: 142000,
    totalCreditUsed: 0,
  },
  {
    id: 4,
    name: 'Zainab Abdi',
    customerIdRef: 'CUST004',
    phone: '+251944567890',
    email: 'zainab@example.com',
    city: 'Jigjiga',
    balance: { balance: 35000, creditAmount: 5000 },
    isActive: false,
    lastTransactionDate: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
    createdAt: new Date(Date.now() - 120*86400000).toISOString(),
    totalPurchased: 32500,
    totalCreditUsed: 2000,
  },
  {
    id: 5,
    name: 'Ibrahim Hussein',
    customerIdRef: 'CUST005',
    phone: '+251955678901',
    email: 'ibrahim@example.com',
    city: 'Bahir Dar',
    balance: { balance: 95000, creditAmount: 20000 },
    isActive: true,
    lastTransactionDate: new Date(Date.now() - 345600000).toISOString(),
    createdAt: new Date(Date.now() - 45*86400000).toISOString(),
    totalPurchased: 118000,
    totalCreditUsed: 5000,
  },
];

export const MOCK_ITEMS = [
  {
    id: 1,
    name: 'Premium Coffee Beans',
    sku: 'ITEM001',
    category: 'Beverages',
    price: 500,
    costPrice: 300,
    stock: 150,
    reorderLevel: 50,
    status: 'In Stock',
    unitsSold: 245,
    lastRestocked: new Date(Date.now() - 604800000).toISOString(),
    totalRevenue: 122500,
  },
  {
    id: 2,
    name: 'Organic Tea',
    sku: 'ITEM002',
    category: 'Beverages',
    price: 350,
    costPrice: 200,
    stock: 200,
    reorderLevel: 80,
    status: 'In Stock',
    unitsSold: 189,
    lastRestocked: new Date(Date.now() - 1209600000).toISOString(),
    totalRevenue: 66150,
  },
  {
    id: 3,
    name: 'Spice Mix Set',
    sku: 'ITEM003',
    category: 'Spices',
    price: 800,
    costPrice: 450,
    stock: 45,
    reorderLevel: 30,
    status: 'Low Stock',
    unitsSold: 156,
    lastRestocked: new Date(Date.now() - 2592000000).toISOString(),
    totalRevenue: 124800,
  },
  {
    id: 4,
    name: 'Honey Jar',
    sku: 'ITEM004',
    category: 'Natural Products',
    price: 1200,
    costPrice: 700,
    stock: 8,
    reorderLevel: 20,
    status: 'Critical',
    unitsSold: 42,
    lastRestocked: new Date(Date.now() - 5184000000).toISOString(),
    totalRevenue: 50400,
  },
  {
    id: 5,
    name: 'Herbal Supplements',
    sku: 'ITEM005',
    category: 'Health',
    price: 450,
    costPrice: 250,
    stock: 320,
    reorderLevel: 100,
    status: 'In Stock',
    unitsSold: 287,
    lastRestocked: new Date(Date.now() - 864000000).toISOString(),
    totalRevenue: 129150,
  },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 1,
    transactionId: 'TRX001',
    customerId: 1,
    customerName: 'Ahmed Hassan',
    itemDescription: 'Premium Coffee Beans (qty: 3)',
    quantity: 3,
    unitPrice: 500,
    totalAmount: 15000,
    amount: 15000,
    date: new Date(Date.now() - 86400000).toISOString(),
    status: 'Completed',
    type: 'Sale',
    items: 3,
    paymentMethod: 'Cash',
  },
  {
    id: 2,
    transactionId: 'TRX002',
    customerId: 2,
    customerName: 'Fatima Mohammed',
    itemDescription: 'Organic Tea (qty: 2), Spice Mix (qty: 1)',
    quantity: 3,
    unitPrice: 2833,
    totalAmount: 8500,
    amount: 8500,
    date: new Date(Date.now() - 172800000).toISOString(),
    status: 'Completed',
    type: 'Sale',
    items: 2,
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 3,
    transactionId: 'TRX003',
    customerId: 3,
    customerName: 'Mohamed Ali',
    itemDescription: 'Honey Jar (qty: 5)',
    quantity: 5,
    unitPrice: 4400,
    totalAmount: 22000,
    amount: 22000,
    date: new Date(Date.now() - 259200000).toISOString(),
    status: 'Pending',
    type: 'Sale',
    items: 5,
    paymentMethod: 'Credit',
  },
  {
    id: 4,
    transactionId: 'TRX004',
    customerId: 5,
    customerName: 'Ibrahim Hussein',
    itemDescription: 'Herbal Supplements (qty: 4)',
    quantity: 4,
    unitPrice: 3000,
    totalAmount: 12000,
    amount: 12000,
    date: new Date(Date.now() - 345600000).toISOString(),
    status: 'Completed',
    type: 'Sale',
    items: 4,
    paymentMethod: 'Cash',
  },
  {
    id: 5,
    transactionId: 'TRX005',
    customerId: 1,
    customerName: 'Ahmed Hassan',
    itemDescription: 'Premium Coffee Beans Return (qty: 1)',
    quantity: 1,
    unitPrice: 500,
    totalAmount: 5000,
    amount: 5000,
    date: new Date(Date.now() - 432000000).toISOString(),
    status: 'Completed',
    type: 'Return',
    items: 1,
    paymentMethod: 'Cash',
  },
];

export const MOCK_APPROVALS = [
  {
    id: 1,
    type: 'Payment Request',
    description: 'Payment for invoice #INV001',
    amount: 50000,
    requester: 'Ahmed Hassan',
    status: 'Pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 604800000).toISOString(),
  },
  {
    id: 2,
    type: 'Credit Request',
    description: 'Credit limit increase request',
    amount: 25000,
    requester: 'Fatima Mohammed',
    status: 'Approved',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    dueDate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    type: 'Refund Request',
    description: 'Refund for damaged goods',
    amount: 5000,
    requester: 'Mohamed Ali',
    status: 'Rejected',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    dueDate: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const MOCK_PAYMENTS = [
  {
    id: 1,
    invoiceNumber: 'INV001',
    customer: 'Ahmed Hassan',
    amount: 50000,
    dueDate: new Date(Date.now() + 604800000).toISOString(),
    status: 'Pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'Invoice for goods delivered',
  },
  {
    id: 2,
    invoiceNumber: 'INV002',
    customer: 'Fatima Mohammed',
    amount: 35000,
    dueDate: new Date(Date.now() + 345600000).toISOString(),
    status: 'Pending',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    description: 'Invoice for goods delivered',
  },
  {
    id: 3,
    invoiceNumber: 'INV003',
    customer: 'Mohamed Ali',
    amount: 75000,
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'Overdue',
    createdAt: new Date(Date.now() - 1209600000).toISOString(),
    description: 'Invoice for goods delivered',
  },
];

export const MOCK_CREDITS = [
  {
    id: 1,
    customer: 'Ahmed Hassan',
    customerId: 1,
    amount: 10000,
    usedAmount: 3000,
    remainingAmount: 7000,
    expiryDate: new Date(Date.now() + 8640000000).toISOString(),
    status: 'Active',
    utilizationRate: 30,
  },
  {
    id: 2,
    customer: 'Fatima Mohammed',
    customerId: 2,
    amount: 15000,
    usedAmount: 8000,
    remainingAmount: 7000,
    expiryDate: new Date(Date.now() + 7776000000).toISOString(),
    status: 'Active',
    utilizationRate: 53,
  },
  {
    id: 3,
    customer: 'Mohamed Ali',
    customerId: 3,
    amount: 25000,
    usedAmount: 0,
    remainingAmount: 25000,
    expiryDate: new Date(Date.now() + 9504000000).toISOString(),
    status: 'Active',
    utilizationRate: 0,
  },
];

export const MOCK_REFUNDS = [
  {
    id: 1,
    invoiceNumber: 'INV001-R',
    customer: 'Ahmed Hassan',
    customerId: 1,
    amount: 5000,
    reason: 'Damaged goods',
    status: 'Pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    description: 'Refund request for damaged items',
  },
  {
    id: 2,
    invoiceNumber: 'INV002-R',
    customer: 'Fatima Mohammed',
    customerId: 2,
    amount: 2500,
    reason: 'Item not as described',
    status: 'Approved',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    description: 'Refund request for wrong items',
  },
];

export const MOCK_NO_VISITS = [
  {
    id: 4,
    name: 'Zainab Abdi',
    customerIdRef: 'CUST004',
    lastVisitDate: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
    phone: '+251944567890',
    email: 'zainab@example.com',
    status: 'Inactive',
    daysWithoutVisit: 15,
    lastTransactionAmount: 35000,
  },
  {
    id: 6,
    name: 'Leul Tesfaye',
    customerIdRef: 'CUST006',
    lastVisitDate: new Date(Date.now() - 1641600000).toISOString(), // 19 days ago
    phone: '+251966789012',
    email: 'leul@example.com',
    status: 'Inactive',
    daysWithoutVisit: 19,
    lastTransactionAmount: 28500,
  },
];

// CALCULATED KPIs - Updated with accurate calculations
export const calculateDashboardKPIs = () => {
  const customers = MOCK_CUSTOMERS;
  const transactions = MOCK_TRANSACTIONS;
  const items = MOCK_ITEMS;
  const payments = MOCK_PAYMENTS;
  const approvals = MOCK_APPROVALS;
  const credits = MOCK_CREDITS;
  
  // Calculate totals
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.isActive).length;
  const inactiveCustomers = customers.filter(c => !c.isActive).length;
  
  // Transaction calculations
  const totalSales = transactions
    .filter(t => t.type === 'Sale')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const totalReturns = transactions
    .filter(t => t.type === 'Return')
    .reduce((sum, t) => sum + t.totalAmount, 0);
  
  const netSales = totalSales - totalReturns;
  
  // Cost calculation
  const totalCost = items.reduce((sum, item) => sum + (item.costPrice * (item.unitsSold || 0)), 0);
  
  // Profit calculations
  const grossProfit = netSales - totalCost;
  const grossMargin = netSales > 0 ? Math.round((grossProfit / netSales) * 100) : 0;
  
  // Stock calculations
  const lowStockItems = items.filter(i => i.stock <= i.reorderLevel).length;
  const totalStockItems = items.length;
  const totalStockValue = items.reduce((sum, item) => sum + (item.price * item.stock), 0);
  
  // Payment calculations
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  const overduePayments = payments.filter(p => p.status === 'Overdue').length;
  const pendingPaymentAmount = payments
    .filter(p => p.status === 'Pending' || p.status === 'Overdue')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Credit calculations
  const totalCredit = credits.reduce((sum, c) => sum + c.amount, 0);
  const usedCredit = credits.reduce((sum, c) => sum + c.usedAmount, 0);
  const availableCredit = credits.reduce((sum, c) => sum + c.remainingAmount, 0);
  const creditUtilization = totalCredit > 0 ? Math.round((usedCredit / totalCredit) * 100) : 0;
  
  // Approval tracking
  const pendingApprovals = approvals.filter(a => a.status === 'Pending').length;
  
  // No visit customers
  const noVisitCustomers = inactiveCustomers;
  
  return {
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    totalSales,
    totalReturns,
    netSales,
    totalCost,
    grossProfit,
    grossMargin,
    totalRevenue: netSales,
    lowStockItems,
    totalStockItems,
    totalStockValue,
    pendingPayments,
    overduePayments,
    pendingPaymentAmount,
    totalCredit,
    usedCredit,
    availableCredit,
    creditUtilization,
    pendingApprovals,
    noVisitCustomers: noVisitCustomers.length,
    uptime: 99.9,
  };
};

export const MOCK_DASHBOARD_KPIs = calculateDashboardKPIs();

export const MOCK_SALES_TREND = [
  { date: '2024-01-15', sales: 45000, target: 50000 },
  { date: '2024-01-16', sales: 52000, target: 50000 },
  { date: '2024-01-17', sales: 48000, target: 50000 },
  { date: '2024-01-18', sales: 61000, target: 50000 },
  { date: '2024-01-19', sales: 55000, target: 50000 },
  { date: '2024-01-20', sales: 58000, target: 50000 },
  { date: '2024-01-21', sales: 52000, target: 50000 },
];

export const MOCK_REVENUE_DATA = [
  { name: 'Beverages', value: 65000 },
  { name: 'Spices', value: 45000 },
  { name: 'Natural Products', value: 55000 },
  { name: 'Health', value: 50000 },
];

export const MOCK_ADMIN_DASHBOARD_KPIs = {
  totalCustomers: 5,
  totalTransactions: 5,
  totalRevenue: 62500,
  activeUsers: 3,
  pendingApprovals: 1,
  systemHealth: 'Good',
  uptime: 99.9,
  lowStockItems: 2,
  pendingPayments: 2,
};

// Helper function to calculate stats for any dataset
export const calculateStats = (data: any[], totalField: string) => {
  if (!data || data.length === 0) return { total: 0, average: 0, min: 0, max: 0 };
  
  const values = data.map(item => item[totalField] || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const average = total / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return { total, average, min, max };
};

// Cache calculation results
let cachedKPIs: any = null;
let lastKPICalculation = 0;

export const getDashboardKPIs = () => {
  const now = Date.now();
  // Recalculate every 5 minutes
  if (!cachedKPIs || (now - lastKPICalculation) > 300000) {
    cachedKPIs = calculateDashboardKPIs();
    lastKPICalculation = now;
  }
  return cachedKPIs;
};
