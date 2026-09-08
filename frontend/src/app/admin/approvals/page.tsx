'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_APPROVALS } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Approval {
  id: number;
  type: string;
  description: string;
  amount: number;
  requester: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  dueDate: string;
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  // Load approvals from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load approvals_data from localStorage
    const storedApprovals = localStorage.getItem('approvals_data');
    let approvalList: Approval[] = [];

    if (storedApprovals) {
      try {
        const parsed = JSON.parse(storedApprovals);
        if (Array.isArray(parsed) && parsed.length > 0) {
          approvalList = parsed;
        } else {
          approvalList = MOCK_APPROVALS;
          localStorage.setItem('approvals_data', JSON.stringify(MOCK_APPROVALS));
        }
      } catch (e) {
        approvalList = MOCK_APPROVALS;
        localStorage.setItem('approvals_data', JSON.stringify(MOCK_APPROVALS));
      }
    } else {
      approvalList = MOCK_APPROVALS;
      localStorage.setItem('approvals_data', JSON.stringify(MOCK_APPROVALS));
    }

    // Load payment requests from localStorage and convert them to approvals
    const storedPaymentRequests = localStorage.getItem('payment_requests');
    if (storedPaymentRequests) {
      try {
        const paymentRequests = JSON.parse(storedPaymentRequests);
        if (Array.isArray(paymentRequests)) {
          const convertedPaymentRequests: Approval[] = paymentRequests.map((request, index) => {
            // Map request type to approval type
            const typeMap: any = {
              'payment': 'Payment Request',
              'credit': 'Credit Request',
              'refund': 'Refund Request'
            };
            
            return {
              id: Math.max(...approvalList.map((a) => a.id), 0) + index + 1,
              type: typeMap[request.type] || 'Payment Request',
              description: request.reason || `${request.type.charAt(0).toUpperCase() + request.type.slice(1)} for ${request.customerName}`,
              amount: request.amount,
              requester: request.customerName,
              status: 'Pending' as const,
              createdAt: request.createdAt || new Date().toISOString(),
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
            };
          });
          approvalList = [...approvalList, ...convertedPaymentRequests];
        }
      } catch (e) {
        console.error('Failed to load payment requests:', e);
      }
    }

    setApprovals(approvalList);
    setFilteredApprovals(approvalList);

    // Extract unique types
    const uniqueTypes = [...new Set(approvalList.map((a) => a.type))];
    setTypes(uniqueTypes as string[]);

    // Calculate stats
    updateStats(approvalList);
    setIsLoading(false);
  }, [router]);

  // Update stats
  const updateStats = (approvalList: Approval[]) => {
    const pending = approvalList.filter((a) => a.status === 'Pending');
    const approved = approvalList.filter((a) => a.status === 'Approved');
    const rejected = approvalList.filter((a) => a.status === 'Rejected');

    const totalPendingAmount = pending.reduce((sum, a) => sum + a.amount, 0);

    setStats({
      totalApprovals: approvalList.length,
      pendingApprovals: pending.length,
      approvedApprovals: approved.length,
      rejectedApprovals: rejected.length,
      totalPendingAmount,
      averageAmount: approvalList.length > 0 
        ? approvalList.reduce((sum: number, a) => sum + a.amount, 0) / approvalList.length 
        : 0,
    });
  };

  // Save approvals to localStorage whenever they change
  useEffect(() => {
    if (!isLoading && approvals.length > 0) {
      localStorage.setItem('approvals_data', JSON.stringify(approvals));
      updateStats(approvals);
    }
  }, [approvals, isLoading]);

  // Apply filters
  useEffect(() => {
    let result = approvals;

    if (filterStatus !== 'all') {
      result = result.filter((a) => a.status === filterStatus);
    }

    if (filterType !== 'all') {
      result = result.filter((a) => a.type === filterType);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.description.toLowerCase().includes(lowerQuery) ||
          a.requester.toLowerCase().includes(lowerQuery) ||
          a.type.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredApprovals(result);
  }, [filterStatus, filterType, searchQuery, approvals]);

  const handleApprove = (id: number) => {
    setApprovals(
      approvals.map((a) => (a.id === id ? { ...a, status: 'Approved' as const } : a))
    );
  };

  const handleReject = (id: number) => {
    setApprovals(
      approvals.map((a) => (a.id === id ? { ...a, status: 'Rejected' as const } : a))
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ fontSize: '1.125rem', color: '#718096' }}>Loading approvals...</div>
      </div>
    );
  }

  const StatCard = ({ icon, label, value, color }: any) => (
    <div className="card" style={{ flex: 1, minWidth: '150px' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: color || 'var(--text-primary)' }}>
        {typeof value === 'number' ? (value > 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()) : value}
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return { bg: '#c6f6d5', color: '#22543d' };
      case 'Pending':
        return { bg: '#feebc8', color: '#7c2d12' };
      case 'Rejected':
        return { bg: '#fed7d7', color: '#742a2a' };
      default:
        return { bg: '#e2e8f0', color: '#2d3748' };
    }
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      'Payment Request': '#bee3f8',
      'Credit Request': '#d6f5d6',
      'Refund Request': '#fed7d7',
    };
    return colors[type] || '#e2e8f0';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Approvals</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Manage payment requests, credits, and refunds</p>
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
            <StatCard icon="📊" label="Total Requests" value={stats.totalApprovals} />
            <StatCard icon="⏳" label="Pending" value={stats.pendingApprovals} color="#ed8936" />
            <StatCard icon="✅" label="Approved" value={stats.approvedApprovals} color="#48bb78" />
            <StatCard icon="❌" label="Rejected" value={stats.rejectedApprovals} color="#fc8181" />
            <StatCard
              icon="💰"
              label="Pending Amount"
              value={formatCurrency(stats.totalPendingAmount || 0)}
              color="#f6ad55"
            />
            <StatCard icon="📈" label="Avg Amount" value={formatCurrency(stats.averageAmount || 0)} />
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search by description or requester..."
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
              <option value="Rejected">Rejected</option>
            </select>

            {types.length > 0 && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <option value="all">All Types</option>
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Approvals Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Requester</th>
                  <th>Amount</th>
                  <th>Requested</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                      No approvals found
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((approval) => {
                    const statusColor = getStatusColor(approval.status);
                    const typeColor = getTypeColor(approval.type);

                    return (
                      <tr key={approval.id}>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '8px',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              background: typeColor,
                            }}
                          >
                            {approval.type}
                          </span>
                        </td>
                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {approval.description}
                        </td>
                        <td style={{ fontWeight: '600' }}>{approval.requester}</td>
                        <td style={{ fontWeight: '600' }}>{formatCurrency(approval.amount)}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{formatDate(approval.createdAt)}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{formatDate(approval.dueDate)}</td>
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
                            {approval.status}
                          </span>
                        </td>
                        <td>
                          {approval.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleApprove(approval.id)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #48bb78',
                                  color: '#48bb78',
                                  cursor: 'pointer',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleReject(approval.id)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #fc8181',
                                  color: '#fc8181',
                                  cursor: 'pointer',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem',
                                  fontWeight: '600',
                                }}
                              >
                                ✕ Reject
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedApproval(approval)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#1B4FA5',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                              }}
                            >
                              View
                            </button>
                          )}
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
        {filteredApprovals.length > 0 && (
          <div className="card" style={{ marginTop: '1.5rem', background: '#f7fafc' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Filtered Records</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{filteredApprovals.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                  {formatCurrency(filteredApprovals.reduce((sum, a) => sum + a.amount, 0))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Average Amount</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4299e1' }}>
                  {formatCurrency(filteredApprovals.reduce((sum, a) => sum + a.amount, 0) / filteredApprovals.length)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Approval Rate</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ed8936' }}>
                  {Math.round(
                    (filteredApprovals.filter((a) => a.status === 'Approved').length / filteredApprovals.length) * 100
                  )}
                  %
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Approval Modal */}
        {selectedApproval && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={() => setSelectedApproval(null)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                overflowY: 'auto',
                zIndex: 10000,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a2332', margin: 0 }}>
                  Approval Details
                </h2>
              </div>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Type */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                    Type
                  </label>
                  <span
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      background: getTypeColor(selectedApproval.type),
                      display: 'inline-block',
                    }}
                  >
                    {selectedApproval.type}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                    Description
                  </label>
                  <p style={{ margin: 0, color: '#2d3748', fontSize: '1rem' }}>
                    {selectedApproval.description}
                  </p>
                </div>

                {/* Requester */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                    Requester
                  </label>
                  <p style={{ margin: 0, color: '#2d3748', fontSize: '1rem' }}>
                    {selectedApproval.requester}
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                    Amount
                  </label>
                  <p style={{ margin: 0, color: '#2d3748', fontSize: '1.125rem', fontWeight: '600' }}>
                    {formatCurrency(selectedApproval.amount)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                    Status
                  </label>
                  <span
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      background: getStatusColor(selectedApproval.status).bg,
                      color: getStatusColor(selectedApproval.status).color,
                      display: 'inline-block',
                    }}
                  >
                    {selectedApproval.status}
                  </span>
                </div>

                {/* Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                      Requested
                    </label>
                    <p style={{ margin: 0, color: '#2d3748' }}>
                      {formatDate(selectedApproval.createdAt)}
                    </p>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', color: '#4a5568', marginBottom: '0.5rem', display: 'block' }}>
                      Due Date
                    </label>
                    <p style={{ margin: 0, color: '#2d3748' }}>
                      {formatDate(selectedApproval.dueDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  onClick={() => setSelectedApproval(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e2e8f0',
                    color: '#2d3748',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
