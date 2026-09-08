'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { creditsService, formatCurrency } from '@/services/data.service';

interface Credit {
  id: number;
  customer: string;
  customerId: number;
  amount: number;
  usedAmount: number;
  remainingAmount: number;
  expiryDate: string;
  status: string;
  utilizationRate: number;
}

export default function CreditsPage() {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Load credits
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const data = await creditsService.getAll(1, 999);
        const creditList = Array.isArray(data) ? data : data.data || [];
        setCredits(creditList);

        // Calculate stats
        const totals = await creditsService.calculateTotals();
        setStats(totals);

        setLoading(false);
      } catch (error) {
        console.error('Error loading credits:', error);
        setLoading(false);
      }
    };

    loadCredits();
  }, []);

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

  const ProgressBar = ({ used, total }: any) => {
    const percentage = total > 0 ? (used / total) * 100 : 0;
    return (
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: percentage > 80 ? '#fc8181' : percentage > 50 ? '#ed8936' : '#48bb78',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    );
  };

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Credit Management</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Monitor customer credit allocations and utilization</p>
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
            <StatCard icon="👥" label="Total Credits" value={stats.totalCredits} />
            <StatCard
              icon="💰"
              label="Total Amount"
              value={formatCurrency(stats.totalCreditAmount || 0)}
              color="#48bb78"
            />
            <StatCard
              icon="💸"
              label="Used Amount"
              value={formatCurrency(stats.totalUsedAmount || 0)}
              color="#ed8936"
            />
            <StatCard
              icon="✨"
              label="Available"
              value={formatCurrency(stats.totalAvailableAmount || 0)}
              color="#4299e1"
            />
            <StatCard icon="📊" label="Avg Utilization" value={`${stats.avgUtilizationRate}%`} color="#667eea" />
          </div>
        )}

        {/* Credits Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total Credit</th>
                  <th>Used</th>
                  <th>Available</th>
                  <th>Utilization</th>
                  <th>Status</th>
                  <th>Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {credits.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                      No credits found
                    </td>
                  </tr>
                ) : (
                  credits.map((credit) => (
                    <tr key={credit.id}>
                      <td style={{ fontWeight: '600' }}>{credit.customer}</td>
                      <td style={{ fontWeight: '600' }}>{formatCurrency(credit.amount)}</td>
                      <td style={{ color: '#ed8936', fontWeight: '600' }}>{formatCurrency(credit.usedAmount)}</td>
                      <td style={{ color: '#48bb78', fontWeight: '600' }}>{formatCurrency(credit.remainingAmount)}</td>
                      <td>
                        <div style={{ width: '100%', minWidth: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{credit.utilizationRate}%</span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: '#718096',
                              }}
                            >
                              {formatCurrency(credit.usedAmount)} / {formatCurrency(credit.amount)}
                            </span>
                          </div>
                          <ProgressBar used={credit.usedAmount} total={credit.amount} />
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: credit.status === 'Active' ? '#c6f6d5' : '#fed7d7',
                            color: credit.status === 'Active' ? '#22543d' : '#742a2a',
                          }}
                        >
                          {credit.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: '#718096' }}>
                        {new Date(credit.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Distribution Chart */}
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Utilization Analysis</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {credits.map((credit) => (
              <div key={credit.id} style={{ background: '#f7fafc', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>{credit.customer}</div>
                <ProgressBar used={credit.usedAmount} total={credit.amount} />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#718096',
                  }}
                >
                  <span>{formatCurrency(credit.usedAmount)}</span>
                  <span>{credit.utilizationRate}%</span>
                  <span>{formatCurrency(credit.remainingAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
