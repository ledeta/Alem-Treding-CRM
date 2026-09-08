'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency } from '@/services/data.service';
import { Users, Plus, Eye, CheckCircle, AlertCircle, Search } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Customer {
  id: number;
  name: string;
  customerIdRef?: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  isActive: boolean;
  balance?: { id: number; balance: number; creditAmount: number; refundAmount: number };
  lastTransactionDate?: string;
  createdAt: string;
  totalPurchases?: number;
}

export default function CustomersPage() {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'lastTransaction'>('name');
  const [stats, setStats] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    isActive: true,
  });

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/customers?page=1&limit=1000`, {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const result = await response.json();
        const data = result.data || [];
        
        setCustomers(data);
        setFilteredCustomers(data);

        let totalBalance = 0;
        let totalCredit = 0;
        
        data.forEach((c: Customer) => {
          const bal = c.balance?.balance;
          const cred = c.balance?.creditAmount;
          if (typeof bal === 'number' && !isNaN(bal) && isFinite(bal)) totalBalance += bal;
          if (typeof cred === 'number' && !isNaN(cred) && isFinite(cred)) totalCredit += cred;
        });

        const activeCount = data.filter((c: Customer) => c.isActive).length;
        const avgBalance = data.length > 0 ? totalBalance / data.length : 0;

        setStats({
          totalCustomers: data.length,
          activeCustomers: activeCount,
          inactiveCustomers: data.length - activeCount,
          totalBalance: Math.max(0, totalBalance),
          totalCreditAmount: Math.max(0, totalCredit),
          averageBalance: Math.max(0, avgBalance),
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading customers:', error);
        setCustomers([]);
        setStats({
          totalCustomers: 0,
          activeCustomers: 0,
          inactiveCustomers: 0,
          totalBalance: 0,
          totalCreditAmount: 0,
          averageBalance: 0,
        });
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  useEffect(() => {
    let result = customers;

    if (filterStatus === 'active') {
      result = result.filter((c) => c.isActive);
    } else if (filterStatus === 'inactive') {
      result = result.filter((c) => !c.isActive);
    }

    if (searchQuery && searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const nameMatch = c.name && c.name.toLowerCase().includes(lowerQuery);
        const phoneMatch = c.phone && c.phone.includes(searchQuery);
        const idMatch = c.customerIdRef && c.customerIdRef.toLowerCase().includes(lowerQuery);
        const emailMatch = c.email && c.email.toLowerCase().includes(lowerQuery);
        const cityMatch = c.city && c.city.toLowerCase().includes(lowerQuery);
        return nameMatch || phoneMatch || idMatch || emailMatch || cityMatch;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'balance') {
        return (b.balance?.balance || 0) - (a.balance?.balance || 0);
      } else if (sortBy === 'lastTransaction') {
        return new Date(b.lastTransactionDate || 0).getTime() - new Date(a.lastTransactionDate || 0).getTime();
      }
      return 0;
    });

    setFilteredCustomers(result);
  }, [searchQuery, filterStatus, sortBy, customers]);

  const handleAddCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      alert('Please fill in Name and Phone');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomer.name,
          phone: newCustomer.phone,
          email: newCustomer.email,
          city: newCustomer.city,
          isActive: newCustomer.isActive,
        }),
      });

      if (!response.ok) throw new Error('Failed to add customer');

      const reloadResponse = await fetch(`${API_URL}/api/customers?page=1&limit=1000`, {
        method: 'GET',
        cache: 'no-store',
      });
      
      const result = await reloadResponse.json();
      const data = result.data || [];
      
      setCustomers(data);
      setFilteredCustomers(data);

      setNewCustomer({ name: '', phone: '', email: '', city: '', isActive: true });
      setShowAddModal(false);
      alert('Customer added successfully!');
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Failed to add customer');
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

  return (
    <AdminLayout>
      <style>{`
        .professional-header {
          background: linear-gradient(135deg, #0F3460 0%, #1B4FA5 50%, #16366d 100%);
          color: white;
          padding: 3rem 2rem;
          box-shadow: 0 12px 32px rgba(15, 52, 96, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: none;
        }
        
        .professional-stat-card {
          background: white;
          border-radius: 14px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1.5px solid #E5E7EB;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        
        .professional-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          border-color: #1B4FA5;
        }
        
        .professional-table {
          background: white;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          border: 1.5px solid #E5E7EB;
          overflow: hidden;
        }
        
        .professional-table-header {
          background: linear-gradient(90deg, #f9fafb 0%, #f3f4f6 100%);
          border-bottom: 2px solid #E5E7EB;
        }
        
        .professional-table-row {
          border-bottom: 1px solid #E5E7EB;
          transition: all 0.2s ease;
        }
        
        .professional-table-row:hover {
          background: #F8FBFF !important;
        }
        
        .professional-btn-primary {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.05rem 2.25rem;
          background: white;
          color: #0F3460;
          border: 1.5px solid #0F3460;
          border-radius: 12px;
          font-size: '0.95rem';
          font-weight: 800;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          letter-spacing: 0.5px;
        }
        
        .professional-btn-primary:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 12px 30px rgba(15, 52, 96, 0.25);
          background: #0F3460;
          color: white;
        }
        
        .stat-value {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 0.75rem 0;
        }
        
        .stat-label {
          font-size: 0.75rem;
          color: #718096;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0 0 0.75rem 0;
        }
        
        .stat-sublabel {
          font-size: 0.8rem;
          color: #a0aec0;
          margin: 0;
        }
      `}</style>

      <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>
        {/* Professional Header */}
        <div className="professional-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                <Users size={28} strokeWidth={2} />
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>
                Customer Management
              </h1>
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', opacity: 0.95, letterSpacing: '0.3px', marginLeft: '64px' }}>
              Comprehensive customer relationship management and analytics
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="professional-btn-primary"
          >
            <Plus size={22} />
            Add New Customer
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '2rem 1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Professional Stat Cards */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.75rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Total Customers', value: stats.totalCustomers, color: '#0F3460', sublabel: `${stats.activeCustomers} active`, icon: '👥' },
                { label: 'Total Balance', value: formatCurrency(stats.totalBalance), color: '#10B981', sublabel: 'All accounts', icon: '💰' },
                { label: 'Total Credit', value: formatCurrency(stats.totalCreditAmount), color: '#F59E0B', sublabel: 'Available', icon: '💳' },
                { label: 'Average Balance', value: formatCurrency(stats.averageBalance), color: '#8B5CF6', sublabel: 'Per customer', icon: '📊' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="professional-stat-card"
                  style={{
                    background: `${stat.color}05`,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    background: `${stat.color}15`,
                    pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{stat.icon}</div>
                    <p style={{ fontSize: '0.75rem', color: '#718096', fontWeight: '700', margin: 0, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {stat.label}
                    </p>
                    <h3 style={{ fontSize: '2.5rem', fontWeight: '900', color: stat.color, margin: 0, marginBottom: '1rem', letterSpacing: '-0.5px' }}>
                      {stat.value}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#a0aec0', margin: 0 }}>{stat.sublabel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search & Filters */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#2d3748', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>
                  Search
                </label>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#cbd5e0' }} />
                  <input
                    type="text"
                    placeholder="Search by name, phone, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem 0.875rem 40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      background: 'white',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#2d3748', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: '#2d3748', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="balance">Balance (High)</option>
                  <option value="lastTransaction">Last Visit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Table */}
          <div className="professional-table">
            {filteredCustomers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <Users size={56} style={{ margin: '0 auto 1.25rem', opacity: 0.2 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: 0, color: '#2d3748', marginBottom: '0.5rem' }}>
                  No customers found
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#718096', margin: 0 }}>
                  Add your first customer or adjust your search filters
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead className="professional-table-header">
                    <tr>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>City</th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credit</th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                      <th style={{ padding: '1.25rem 1rem', textAlign: 'left', fontWeight: '700', color: '#1B4FA5', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer, index) => (
                      <tr
                        key={customer.id}
                        className="professional-table-row"
                        style={{ background: index % 2 === 0 ? 'white' : '#f9fafb' }}
                      >
                        <td style={{ padding: '1.25rem 1rem', fontWeight: '700', color: '#1B4FA5' }}>
                          <span style={{ background: '#dbeafe', padding: '0.375rem 0.875rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                            #{customer.customerIdRef || customer.id}
                          </span>
                        </td>
                        <td style={{ padding: '1.25rem 1rem', color: '#2d3748', fontWeight: '600' }}>{customer.name}</td>
                        <td style={{ padding: '1.25rem 1rem', color: '#4a5568' }}>
                          <div style={{ fontSize: '0.9rem' }}>{customer.phone}</div>
                          {customer.email && <div style={{ color: '#718096', fontSize: '0.8rem', marginTop: '0.25rem' }}>{customer.email}</div>}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', color: '#4a5568', fontSize: '0.9rem' }}>{customer.city || '—'}</td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: '700', color: '#10B981', fontSize: '0.95rem' }}>
                          {formatCurrency(customer.balance?.balance || 0)}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: '700', color: '#F59E0B', fontSize: '0.95rem' }}>
                          {formatCurrency(customer.balance?.creditAmount || 0)}
                        </td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: customer.isActive ? '#dcfce7' : '#fee2e2',
                            color: customer.isActive ? '#166534' : '#991b1b',
                            borderRadius: '8px',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                          }}>
                            {customer.isActive ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowDetail(true);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.5rem 1rem',
                              background: '#dbeafe',
                              color: '#1e40af',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#bfdbfe';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#dbeafe';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals (keeping existing implementation) */}
      {showDetail && selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' }} onClick={() => setShowDetail(false)}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '600px', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #0F3460 0%, #1B4FA5 100%)', padding: '2rem', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Customer Details</h2>
              <button onClick={() => setShowDetail(false)} style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#1B4FA5' }}>Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div><p style={{ margin: 0, fontSize: '0.8rem', color: '#718096', fontWeight: '700', marginBottom: '0.5rem' }}>Name</p><p style={{ margin: 0, fontSize: '0.95rem', color: '#2d3748', fontWeight: '600', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>{selectedCustomer.name}</p></div>
                  <div><p style={{ margin: 0, fontSize: '0.8rem', color: '#718096', fontWeight: '700', marginBottom: '0.5rem' }}>Phone</p><p style={{ margin: 0, fontSize: '0.95rem', color: '#2d3748', fontWeight: '600', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>{selectedCustomer.phone}</p></div>
                </div>
              </div>
              <div style={{ height: '1px', background: '#e5e7eb', marginBottom: '2rem' }} />
              <div><h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: '700', color: '#1B4FA5' }}>Financial</h3><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#f9fafb', padding: '1.5rem', borderRadius: '10px', border: '1px solid #e5e7eb' }}><div><p style={{ margin: 0, fontSize: '0.75rem', color: '#718096', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Balance</p><p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#10B981' }}>{formatCurrency(selectedCustomer.balance?.balance || 0)}</p></div><div><p style={{ margin: 0, fontSize: '0.75rem', color: '#718096', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Credit</p><p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#F59E0B' }}>{formatCurrency(selectedCustomer.balance?.creditAmount || 0)}</p></div><div><p style={{ margin: 0, fontSize: '0.75rem', color: '#718096', fontWeight: '700', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Purchases</p><p style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#8B5CF6' }}>{formatCurrency(selectedCustomer.totalPurchases || 0)}</p></div></div></div>
              <button onClick={() => setShowDetail(false)} style={{ width: '100%', padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #1B4FA5 0%, #1639a3 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', marginTop: '2rem', cursor: 'pointer', fontSize: '0.95rem' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '20px' }} onClick={() => setShowAddModal(false)}>
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)', width: '100%', maxWidth: '550px', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #0F3460 0%, #1B4FA5 100%)', padding: '2rem', borderTopLeftRadius: '16px', borderTopRightRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>Add New Customer</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ marginBottom: '1.5rem' }}><label style={{ fontSize: '0.85rem', color: '#2d3748', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Full Name *</label><input type="text" placeholder="Enter customer name" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', fontWeight: '500' }} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label style={{ fontSize: '0.85rem', color: '#2d3748', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Phone Number *</label><input type="tel" placeholder="+251911234567" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', fontWeight: '500' }} /></div>
              <div style={{ marginBottom: '1.5rem' }}><label style={{ fontSize: '0.85rem', color: '#2d3748', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>Email Address</label><input type="email" placeholder="customer@example.com" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', fontWeight: '500' }} /></div>
              <div style={{ marginBottom: '2rem' }}><label style={{ fontSize: '0.85rem', color: '#2d3748', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>City</label><input type="text" placeholder="City name" value={newCustomer.city} onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })} style={{ width: '100%', padding: '0.875rem 1rem', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', fontWeight: '500' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button onClick={handleAddCustomer} style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #0F3460 0%, #1B4FA5 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>Add Customer</button>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '1rem 1.5rem', background: '#e2e8f0', color: '#2d3748', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
