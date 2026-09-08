'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { formatCurrency, formatDate, getDaysAgo } from '@/services/data.service';

interface Customer {
  id: number;
  name: string;
  customerIdRef?: string;
  phone: string;
  email?: string;
  city?: string;
  isActive: boolean;
  balance?: { balance: number; creditAmount: number };
  lastTransactionDate?: string;
  createdAt: string;
  totalPurchased?: number;
  totalCreditUsed?: number;
}

export default function ViewCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Load customer
  useEffect(() => {
    const loadCustomer = () => {
      try {
        // Get customers from localStorage
        const storedCustomers = localStorage.getItem('customers_data');
        let customers: Customer[] = [];

        if (storedCustomers) {
          try {
            customers = JSON.parse(storedCustomers);
          } catch (e) {
            customers = [];
          }
        }

        // Find the customer by ID
        const foundCustomer = customers.find((c) => c.id === id);

        if (foundCustomer) {
          setCustomer(foundCustomer);
        } else {
          // Customer not found, redirect back
          setTimeout(() => router.push('/customers'), 2000);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading customer:', error);
        setLoading(false);
      }
    };

    loadCustomer();
  }, [id, router]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div className="spinner" />
        </div>
      </MainLayout>
    );
  }

  if (!customer) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Customer Not Found</h2>
          <p>Redirecting back to customers...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button
              onClick={() => router.push('/customers')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              ← Back to Customers
            </button>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0 0 0' }}>{customer.name}</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Customer Details & Account Info</p>
          </div>
          <button
            onClick={() => router.push(`/customers/${customer.id}/edit`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ✏️ Edit Customer
          </button>
        </div>

        {/* Customer Overview Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {/* Customer ID */}
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Customer ID</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{customer.customerIdRef || customer.id}</div>
            </div>

            {/* Status */}
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Status</div>
              <span
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  background: customer.isActive ? '#c6f6d5' : '#fed7d7',
                  color: customer.isActive ? '#22543d' : '#742a2a',
                  display: 'inline-block',
                }}
              >
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Member Since */}
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Member Since</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{formatDate(customer.createdAt)}</div>
            </div>

            {/* Last Visit */}
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Last Visit</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                {getDaysAgo(customer.lastTransactionDate || customer.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Contact Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Phone</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{customer.phone}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Email</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{customer.email || 'N/A'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>City</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{customer.city || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Financial Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Account Balance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                {formatCurrency(customer.balance?.balance || 0)}
              </div>
            </div>

            <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Available Credit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ed8936' }}>
                {formatCurrency(customer.balance?.creditAmount || 0)}
              </div>
            </div>

            <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Purchased</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                {formatCurrency(customer.totalPurchased || 0)}
              </div>
            </div>

            <div style={{ background: '#f7fafc', padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Credit Used</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f6ad55' }}>
                {formatCurrency(customer.totalCreditUsed || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => router.push(`/customers/${customer.id}/edit`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ✏️ Edit Customer
          </button>
          <button
            onClick={() => router.push('/customers')}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#e2e8f0',
              color: '#2d3748',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ← Back to Customers
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
