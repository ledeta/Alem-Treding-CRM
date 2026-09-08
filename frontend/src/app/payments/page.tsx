'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { CreditCard, Calendar, Users, TrendingUp } from 'lucide-react';

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="spinner" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ padding: '2rem 1rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Payments</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Payment Processing & Tracking • All transactions
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          <div className="card card-hover" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea20 0%, #667eea40 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CreditCard size={24} />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
              Total Payments
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              ብር 125,450
            </div>
          </div>

          <div className="card card-hover" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #48bb7820 0%, #48bb7840 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TrendingUp size={24} />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
              Completed
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              145 transactions
            </div>
          </div>

          <div className="card card-hover" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ed893620 0%, #ed893640 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Calendar size={24} />
              </div>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>
              Pending
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              ብር 23,890
            </div>
          </div>
        </div>

        {/* Recent Payments Table */}
        <div className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>Recent Payments</h3>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#PAY-001</td>
                  <td>Abebe Kebede</td>
                  <td style={{ fontWeight: '600' }}>ብር 15,000</td>
                  <td>Aug 16, 2026</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: '#c6f6d5',
                      color: '#22543d',
                    }}>
                      Completed
                    </span>
                  </td>
                  <td>Bank Transfer</td>
                </tr>
                <tr>
                  <td>#PAY-002</td>
                  <td>Almaz Teshome</td>
                  <td style={{ fontWeight: '600' }}>ბር 8,500</td>
                  <td>Aug 15, 2026</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: '#feebc8',
                      color: '#7c2d12',
                    }}>
                      Pending
                    </span>
                  </td>
                  <td>Cash</td>
                </tr>
                <tr>
                  <td>#PAY-003</td>
                  <td>Girma Solomon</td>
                  <td style={{ fontWeight: '600' }}>ብር 22,000</td>
                  <td>Aug 14, 2026</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      background: '#c6f6d5',
                      color: '#22543d',
                    }}>
                      Completed
                    </span>
                  </td>
                  <td>Mobile Payment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
