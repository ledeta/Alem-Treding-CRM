'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<Approval[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  useEffect(() => {
    const loadApprovals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        // Use apiClient which handles token injection automatically
        const response = await fetch(`${API_URL}/api/approvals?page=1&limit=50`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        const data = result.data || result || [];
        
        // Transform API response to match Approval interface
        const transformedApprovals = Array.isArray(data) ? data.map((item: any) => ({
          id: item.id,
          type: item.type || 'Request',
          description: item.description || '',
          amount: item.amount || 0,
          requester: item.requesterName || item.requester || 'Unknown',
          status: item.status || 'Pending',
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          dueDate: item.dueDate ? new Date(item.dueDate).toLocaleDateString() : new Date().toLocaleDateString(),
        })) : [];

        setApprovals(transformedApprovals);
        setFilteredApprovals(transformedApprovals);
        setError(null);
      } catch (err) {
        console.error('Error loading approvals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load approvals');
        setApprovals([]);
        setFilteredApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    loadApprovals();
  }, []);

  useEffect(() => {
    filterApprovals();
  }, [approvals, searchTerm, statusFilter]);

  const filterApprovals = () => {
    let filtered = approvals;

    if (searchTerm) {
      filtered = filtered.filter(
        (approval) =>
          approval.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          approval.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
          approval.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((approval) => approval.status === statusFilter);
    }

    setFilteredApprovals(filtered);
  };

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/approvals/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ decision: 'approved', notes: '' }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to approve: ${response.status}`);
      }

      // Update local state
      setApprovals(
        approvals.map((a) =>
          a.id === id ? { ...a, status: 'Approved' as const } : a
        )
      );
    } catch (err) {
      console.error('Error approving:', err);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_URL}/api/approvals/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ decision: 'rejected', notes: '' }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to reject: ${response.status}`);
      }

      // Update local state
      setApprovals(
        approvals.map((a) =>
          a.id === id ? { ...a, status: 'Rejected' as const } : a
        )
      );
    } catch (err) {
      console.error('Error rejecting:', err);
      alert('Failed to reject request');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="spinner" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1.5rem',
            textAlign: 'center',
          }}>
            <h2 style={{ color: '#991b1b', margin: '0 0 0.5rem 0' }}>Error Loading Approvals</h2>
            <p style={{ color: '#7f1d1d', margin: 0 }}>{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const stats = {
    total: approvals.length,
    pending: approvals.filter((a) => a.status === 'Pending').length,
    approved: approvals.filter((a) => a.status === 'Approved').length,
    rejected: approvals.filter((a) => a.status === 'Rejected').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return { bg: '#fef3c7', text: '#92400e', icon: Clock };
      case 'Approved':
        return { bg: '#dcfce7', text: '#166534', icon: CheckCircle };
      case 'Rejected':
        return { bg: '#fee2e2', text: '#991b1b', icon: XCircle };
      default:
        return { bg: '#f3f4f6', text: '#374151', icon: Clock };
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '1.5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>
            View Approvals
          </h1>
          <p style={{ color: '#718096', margin: 0 }}>
            Manage pending requests and approvals
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div className="card" style={{
            background: 'linear-gradient(135deg, #1B4FA5 0%, #0F3460 100%)',
            color: 'white',
          }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Total Approvals
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
              {stats.total}
            </div>
          </div>

          <div className="card" style={{
            borderLeft: '4px solid #f59e0b',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
              Pending
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f59e0b' }}>
              {stats.pending}
            </div>
          </div>

          <div className="card" style={{
            borderLeft: '4px solid #10b981',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
              Approved
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#10b981' }}>
              {stats.approved}
            </div>
          </div>

          <div className="card" style={{
            borderLeft: '4px solid #ef4444',
          }}>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
              Rejected
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ef4444' }}>
              {stats.rejected}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
              }} />
              <input
                type="text"
                placeholder="Search approvals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={{
                    padding: '8px 16px',
                    border: statusFilter === status ? 'none' : '1px solid #e5e7eb',
                    borderRadius: '6px',
                    background: statusFilter === status ? '#1B4FA5' : 'white',
                    color: statusFilter === status ? 'white' : '#6b7280',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: statusFilter === status ? '600' : '500',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (statusFilter !== status) {
                      (e.currentTarget as HTMLElement).style.background = '#f9fafb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (statusFilter !== status) {
                      (e.currentTarget as HTMLElement).style.background = 'white';
                    }
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Approvals List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredApprovals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ fontSize: '0.875rem', color: '#718096' }}>
                No approvals found
              </div>
            </div>
          ) : (
            filteredApprovals.map((approval) => {
              const statusConfig = getStatusColor(approval.status);
              const StatusIcon = statusConfig.icon;
              return (
                <div key={approval.id} className="card" style={{
                  borderLeft: `4px solid ${
                    approval.status === 'Pending' ? '#f59e0b' :
                    approval.status === 'Approved' ? '#10b981' : '#ef4444'
                  }`,
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem',
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          background: statusConfig.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <StatusIcon size={18} style={{ color: statusConfig.text }} />
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                          }}>
                            {approval.type}
                          </div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#718096',
                          }}>
                            {approval.requester}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '0.75rem',
                      }}>
                        {approval.description}
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.8rem',
                        color: '#9ca3af',
                        flexWrap: 'wrap',
                      }}>
                        <span>Amount: <strong style={{ color: 'var(--text-primary)' }}>ብር {approval.amount.toLocaleString()}</strong></span>
                        <span>Created: {approval.createdAt}</span>
                        <span>Due: {approval.dueDate}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {approval.status === 'Pending' && (
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        minWidth: '160px',
                      }}>
                        <button
                          onClick={() => handleApprove(approval.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '#059669';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '#10b981';
                          }}
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(approval.id)}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '#dc2626';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '#ef4444';
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}

                    {approval.status !== 'Pending' && (
                      <div style={{
                        padding: '8px 16px',
                        background: statusConfig.bg,
                        color: statusConfig.text,
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                      }}>
                        {approval.status}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
