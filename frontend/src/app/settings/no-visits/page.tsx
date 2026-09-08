'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { noVisitsService, formatCurrency, formatDate, getDaysAgo } from '@/services/data.service';
import { MOCK_NO_VISITS } from '@/lib/mock-data';

interface InactiveCustomer {
  id: number;
  name: string;
  customerIdRef: string;
  lastVisitDate: string;
  phone: string;
  email: string;
  status: string;
  daysWithoutVisit: number;
  lastTransactionAmount: number;
}

export default function NoVisitsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<InactiveCustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<InactiveCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [daysThreshold, setDaysThreshold] = useState(15);
  const [sortBy, setSortBy] = useState<'days' | 'name' | 'lastAmount'>('days');
  const [stats, setStats] = useState<any>(null);

  // Load inactive customers
  useEffect(() => {
    const loadInactiveCustomers = async () => {
      try {
        // Using mock data for now
        const data = MOCK_NO_VISITS.filter((c) => c.daysWithoutVisit >= daysThreshold);
        setCustomers(data);
        setFilteredCustomers(data);

        // Calculate stats
        const totalDaysLost = data.reduce((sum, c) => sum + c.daysWithoutVisit, 0);
        const lostRevenue = data.reduce((sum, c) => sum + c.lastTransactionAmount, 0);
        const avgDays = data.length > 0 ? Math.round(totalDaysLost / data.length) : 0;

        setStats({
          totalInactiveCustomers: data.length,
          totalDaysLost,
          lostRevenue,
          averageDaysInactive: avgDays,
          highestDaysInactive: data.length > 0 ? Math.max(...data.map((c) => c.daysWithoutVisit)) : 0,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading inactive customers:', error);
        setLoading(false);
      }
    };

    loadInactiveCustomers();
  }, [daysThreshold]);

  // Apply filters and search
  useEffect(() => {
    let result = customers;

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.phone.includes(searchQuery) ||
          c.customerIdRef.includes(searchQuery) ||
          c.email.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'days') {
        return b.daysWithoutVisit - a.daysWithoutVisit;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'lastAmount') {
        return (b.lastTransactionAmount || 0) - (a.lastTransactionAmount || 0);
      }
      return 0;
    });

    setFilteredCustomers(result);
  }, [searchQuery, sortBy, customers]);

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
        {typeof value === 'number' ? (value > 1000 ? `${(value / 1000).toFixed(1)}K` : value.toLocaleString()) : value}
      </div>
    </div>
  );

  const getRiskColor = (days: number) => {
    if (days >= 30) return { bg: '#fed7d7', color: '#742a2a', label: 'Critical' };
    if (days >= 20) return { bg: '#feebc8', color: '#7c2d12', label: 'High Risk' };
    return { bg: '#fed7d7', color: '#742a2a', label: 'At Risk' };
  };

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem' }}>Inactive Customers</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Track customers who haven't made purchases recently</p>
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
            <StatCard icon="❌" label="Inactive Customers" value={stats.totalInactiveCustomers} color="#fc8181" />
            <StatCard
              icon="📅"
              label="Avg Days Inactive"
              value={stats.averageDaysInactive}
              color="#ed8936"
            />
            <StatCard
              icon="📊"
              label="Highest Days"
              value={stats.highestDaysInactive}
              color="#f6ad55"
            />
            <StatCard
              icon="💰"
              label="Potential Lost Revenue"
              value={formatCurrency(stats.lostRevenue || 0)}
              color="#fc8181"
            />
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder="Search by name, phone, or ID..."
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

            {/* Days Threshold */}
            <div>
              <label style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem', display: 'block' }}>
                Days Without Visit
              </label>
              <select
                value={daysThreshold}
                onChange={(e) => setDaysThreshold(parseInt(e.target.value))}
                style={{
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <option value={7}>Last 7 days</option>
                <option value={15}>Last 15 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

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
              <option value="days">Sort by Days Inactive</option>
              <option value="name">Sort by Name</option>
              <option value="lastAmount">Sort by Last Amount</option>
            </select>
          </div>
        </div>

        {/* Inactive Customers Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Last Visit</th>
                  <th>Days Inactive</th>
                  <th>Last Amount</th>
                  <th>Risk Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                      {searchQuery ? 'No inactive customers match your search' : 'No inactive customers found'}
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const riskInfo = getRiskColor(customer.daysWithoutVisit);

                    return (
                      <tr key={customer.id}>
                        <td style={{ fontWeight: '600' }}>#{customer.customerIdRef}</td>
                        <td>{customer.name}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{customer.phone}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>{customer.email}</td>
                        <td style={{ fontSize: '0.875rem', color: '#718096' }}>
                          {formatDate(customer.lastVisitDate)}
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '8px',
                              background: riskInfo.bg,
                              color: riskInfo.color,
                              fontSize: '0.875rem',
                              fontWeight: '600',
                            }}
                          >
                            {customer.daysWithoutVisit} days
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>{formatCurrency(customer.lastTransactionAmount)}</td>
                        <td>
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              background: riskInfo.bg,
                              color: riskInfo.color,
                            }}
                          >
                            {riskInfo.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => router.push(`/customers/${customer.id}`)}
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
                            <button
                              onClick={() => router.push(`/transactions?customer=${customer.id}`)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#4299e1',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                              }}
                            >
                              History
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recommendations */}
        <div className="card" style={{ marginTop: '1.5rem', background: '#fffaf0', borderLeft: '4px solid #ed8936' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#ed8936' }}>📋 Recommendations</h3>
          <ul
            style={{
              margin: 0,
              paddingLeft: '1.5rem',
              color: '#744210',
            }}
          >
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Follow up with high-risk customers:</strong> Customers inactive for 30+ days need immediate attention
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Loyalty programs:</strong> Consider offering incentives to re-engage inactive customers
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              <strong>Review products:</strong> Check if inactive customers had issues with previous purchases
            </li>
            <li>
              <strong>Communication:</strong> Send personalized messages or surveys to understand reasons for inactivity
            </li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
