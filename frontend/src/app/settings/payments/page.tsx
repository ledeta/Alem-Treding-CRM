'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { paymentsService, formatCurrency, formatDate, getDaysAgo } from '@/services/data.service';

interface Payment {
  id: number;
  invoiceNumber: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: string;
  createdAt: string;
  description: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Overdue' | 'Completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Load payments
  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await paymentsService.getAll(1, 999);
        const paymentList = Array.isArray(data) ? data : data.data || [];
        setPayments(paymentList);
        setFilteredPayments(paymentList);

        // Calculate stats
        const totals = await paymentsService.calculateTotals();
        setStats(totals);

        setLoading(false);
      } catch (error) {
        console.error('Error loading payments:', error);
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = payments;

    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(lowerQuery) ||
          p.customer.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredPayments(result);
  }, [filterStatus, searchQuery, payments]);

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

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    return days;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: '#c6f6d5', color: '#22543d' };
      case 'Pending':
        return { bg: '#feebc8', color: '#7c2d12' };
      case 'Overdue':
        return { bg: '#fed7d7', color: '#742a2a' };
      default:
        return { bg: '#e2e8f0', color: '#2d3748' };
    }
  };

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Invoices & Payments</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track invoices, payments, and payment status</p>
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
            <StatCard icon="📊" label="Total Invoices" value={stats.totalPayments} />
            <StatCard icon="⏳" label="Pending" value={stats.pendingPayments} color="#ed8936" />
            <StatCard icon="🚨" label="Overdue" value={stats.overduePayments} color="#fc8181" />
            <StatCard icon="💰" label="Total Amount" value={formatCurrency(stats.totalAmount || 0)} color="#48bb78" />
            <StatCard icon="💸" label="Pending Amount" value={formatCurrency(stats.pendingAmount || 0)} color="#f6ad55" />
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search by invoice or customer..."
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
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Created</th>
                  <th>Due Date</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => {
                    const daysUntilDue = getDaysUntilDue(payment.dueDate);
                    const statusColor = getStatusColor(payment.status);

                    return (
                      <tr key={payment.id}>
                        <td style={{ fontWeight: '600' }}>#{payment.invoiceNumber}</td>
                        <td>{payment.customer}</td>
                        <td style={{ fontWeight: '600' }}>{formatCurrency(payment.amount)}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{formatDate(payment.createdAt)}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{formatDate(payment.dueDate)}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              background: daysUntilDue < 0 ? '#fed7d7' : daysUntilDue < 3 ? '#feebc8' : '#c6f6d5',
                              color: daysUntilDue < 0 ? '#742a2a' : daysUntilDue < 3 ? '#7c2d12' : '#22543d',
                            }}
                          >
                            {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)}d overdue` : `${daysUntilDue}d`}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              background: statusColor.bg,
                              color: statusColor.color,
                            }}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => router.push(`/settings/payments/${payment.id}`)}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {filteredPayments.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem', background: '#f7fafc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Records</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{filteredPayments.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                  {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Average Invoice</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4299e1' }}>
                  {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0) / filteredPayments.length)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Success Rate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ed8936' }}>
                  {Math.round(
                    (filteredPayments.filter((p) => p.status === 'Completed').length / filteredPayments.length) * 100
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
