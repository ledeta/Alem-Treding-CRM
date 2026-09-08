'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { transactionsService, formatCurrency, formatDate } from '@/services/data.service';

interface Transaction {
  id: number;
  transactionId: string;
  customerId: number;
  customerName: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  amount: number;
  date: string;
  status: string;
  type: string;
  items: number;
  paymentMethod: string;
}

function TransactionsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Pending'>('all');
  const [filterType, setFilterType] = useState<'all' | 'Sale' | 'Return'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [stats, setStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const customerId = searchParams.get('customer');
        let data: any = await transactionsService.getAll(1, 999);
        data = Array.isArray(data) ? data : data.data || [];

        if (customerId) {
          data = data.filter((t: any) => t.customerId === parseInt(customerId));
        }

        setTransactions(data);
        setFilteredTransactions(data);

        // Calculate stats
        const totals = await transactionsService.calculateTotals();
        setStats(totals);

        setLoading(false);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setLoading(false);
      }
    };

    loadTransactions();
  }, [searchParams]);

  // Apply filters and search
  useEffect(() => {
    let result = transactions;

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((t) => t.status === filterStatus);
    }

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.transactionId.toLowerCase().includes(lowerQuery) ||
          t.customerName.toLowerCase().includes(lowerQuery) ||
          t.itemDescription.toLowerCase().includes(lowerQuery)
      );
    }

    // Date range
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).getTime();
      result = result.filter((t) => new Date(t.date).getTime() >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).getTime();
      result = result.filter((t) => new Date(t.date).getTime() <= endDate);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'amount') {
        return (b.totalAmount || 0) - (a.totalAmount || 0);
      }
      return 0;
    });

    setFilteredTransactions(result);
  }, [searchQuery, filterStatus, filterType, sortBy, dateRange, transactions]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="spinner" />
        </div>
      </MainLayout>
    );
  }

  const StatCard = ({ icon, label, value, color }: any) => (
    <div className="card" style={{ flex: 1, minWidth: '150px' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: color || 'var(--text-primary)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Transactions</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Complete transaction history and records</p>
        </div>

        {/* Stats */}
        {stats && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <StatCard icon="📊" label="Total Transactions" value={stats.totalTransactions} />
            <StatCard icon="✅" label="Completed" value={stats.completedTransactions} color="#48bb78" />
            <StatCard icon="⏳" label="Pending" value={stats.pendingTransactions} color="#ed8936" />
            <StatCard icon="💰" label="Total Revenue" value={formatCurrency(stats.totalRevenue || 0)} color="#667eea" />
            <StatCard icon="💸" label="Pending Amount" value={formatCurrency(stats.pendingAmount || 0)} color="#f6ad55" />
            <StatCard icon="📈" label="Average Value" value={formatCurrency(stats.averageTransaction || 0)} />
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search by ID, customer, or item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              style={{
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            >
              <option value="all">All Types</option>
              <option value="Sale">Sales</option>
              <option value="Return">Returns</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '0.75rem',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '0.9rem',
              }}
            >
              <option value="date">Latest First</option>
              <option value="amount">Highest Amount</option>
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem', display: 'block' }}>
                From Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem', display: 'block' }}>
                To Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            {(dateRange.start || dateRange.end) && (
              <button
                onClick={() => setDateRange({ start: '', end: '' })}
                style={{
                  alignSelf: 'flex-end',
                  padding: '0.75rem 1rem',
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                      {searchQuery || dateRange.start || dateRange.end ? 'No transactions match your filters' : 'No transactions found'}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td style={{ fontWeight: '600' }}>#{transaction.transactionId}</td>
                      <td>{transaction.customerName}</td>
                      <td style={{ textAlign: 'center' }}>{transaction.items || transaction.quantity}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {transaction.itemDescription}
                      </td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency(transaction.totalAmount || transaction.amount)}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: transaction.type === 'Sale' ? '#c6f6d5' : '#fed7d7',
                            color: transaction.type === 'Sale' ? '#22543d' : '#742a2a',
                          }}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td>{transaction.paymentMethod || 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: transaction.status === 'Completed' ? '#c6f6d5' : '#feebc8',
                            color: transaction.status === 'Completed' ? '#22543d' : '#7c2d12',
                          }}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => router.push(`/transactions/${transaction.id}`)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem', background: '#f7fafc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Filtered Records</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{filteredTransactions.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                  {formatCurrency(
                    filteredTransactions.reduce((sum, t) => sum + (t.totalAmount || t.amount || 0), 0)
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Average Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4299e1' }}>
                  {formatCurrency(
                    filteredTransactions.reduce((sum, t) => sum + (t.totalAmount || t.amount || 0), 0) /
                      filteredTransactions.length
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Completed Ratio</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ed8936' }}>
                  {Math.round(
                    (filteredTransactions.filter((t) => t.status === 'Completed').length / filteredTransactions.length) * 100
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function LoadingFallback() {
  return (
    <MainLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div className="spinner" />
      </div>
    </MainLayout>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TransactionsContent />
    </Suspense>
  );
}
