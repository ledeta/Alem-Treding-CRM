'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { refundsService, formatCurrency, formatDate } from '@/services/data.service';

interface Refund {
  id: number;
  invoiceNumber: string;
  customer: string;
  customerId: number;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  description: string;
}

export default function RefundsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [filteredRefunds, setFilteredRefunds] = useState<Refund[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Approved' | 'Completed' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Load refunds
  useEffect(() => {
    const loadRefunds = async () => {
      try {
        const data = await refundsService.getAll(1, 999);
        const refundList = Array.isArray(data) ? data : data.data || [];
        setRefunds(refundList);
        setFilteredRefunds(refundList);

        // Calculate stats
        const totals = await refundsService.calculateTotals();
        setStats(totals);

        setLoading(false);
      } catch (error) {
        console.error('Error loading refunds:', error);
        setLoading(false);
      }
    };

    loadRefunds();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = refunds;

    if (filterStatus !== 'all') {
      result = result.filter((r) => r.status === filterStatus);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.invoiceNumber.toLowerCase().includes(lowerQuery) ||
          r.customer.toLowerCase().includes(lowerQuery) ||
          r.reason.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredRefunds(result);
  }, [filterStatus, searchQuery, refunds]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: '#c6f6d5', color: '#22543d' };
      case 'Approved':
        return { bg: '#bee3f8', color: '#2c5282' };
      case 'Pending':
        return { bg: '#feebc8', color: '#7c2d12' };
      case 'Rejected':
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
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Refunds</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track and manage customer refunds</p>
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
            <StatCard icon="📊" label="Total Refunds" value={stats.totalRefunds} />
            <StatCard icon="⏳" label="Pending" value={stats.pendingRefunds} color="#ed8936" />
            <StatCard icon="✅" label="Approved" value={stats.approvedRefunds} color="#4299e1" />
            <StatCard icon="✓" label="Completed" value={stats.completedRefunds} color="#48bb78" />
            <StatCard icon="❌" label="Rejected" value={stats.completedRefunds} color="#fc8181" />
            <StatCard icon="💰" label="Total Amount" value={formatCurrency(stats.totalRefundAmount || 0)} />
            <StatCard icon="💸" label="Pending Amount" value={formatCurrency(stats.pendingRefundAmount || 0)} color="#ed8936" />
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search by invoice, customer, or reason..."
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
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Reason</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                      No refunds found
                    </td>
                  </tr>
                ) : (
                  filteredRefunds.map((refund) => {
                    const statusColor = getStatusColor(refund.status);

                    return (
                      <tr key={refund.id}>
                        <td style={{ fontWeight: '600' }}>#{refund.invoiceNumber}</td>
                        <td>{refund.customer}</td>
                        <td style={{ fontWeight: '600' }}>{formatCurrency(refund.amount)}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{refund.reason}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.875rem' }}>
                          {refund.description}
                        </td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{formatDate(refund.createdAt)}</td>
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
                            {refund.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => router.push(`/settings/refunds/${refund.id}`)}
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
        {filteredRefunds.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem', background: '#f7fafc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Filtered Records</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{filteredRefunds.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                  {formatCurrency(filteredRefunds.reduce((sum, r) => sum + r.amount, 0))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Average Refund</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4299e1' }}>
                  {formatCurrency(filteredRefunds.reduce((sum, r) => sum + r.amount, 0) / filteredRefunds.length)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Approval Rate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ed8936' }}>
                  {Math.round(
                    ((filteredRefunds.filter((r) => r.status === 'Approved' || r.status === 'Completed').length /
                      filteredRefunds.length) *
                      100) || 0
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
