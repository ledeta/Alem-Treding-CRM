'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';

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

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    email: '',
    city: '',
    isActive: true,
  });

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
          setEditData({
            name: foundCustomer.name,
            phone: foundCustomer.phone,
            email: foundCustomer.email || '',
            city: foundCustomer.city || '',
            isActive: foundCustomer.isActive,
          });
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

  const handleSave = () => {
    if (!editData.name.trim() || !editData.phone.trim()) {
      alert('Please fill in Name and Phone');
      return;
    }

    setSaving(true);

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

      // Find and update the customer
      const customerIndex = customers.findIndex((c) => c.id === id);

      if (customerIndex >= 0) {
        customers[customerIndex] = {
          ...customers[customerIndex],
          ...editData,
        };

        // Save to localStorage
        localStorage.setItem('customers_data', JSON.stringify(customers));

        alert('Customer updated successfully!');
        setTimeout(() => router.push(`/customers/${id}`), 500);
      }

      setSaving(false);
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Error saving customer');
      setSaving(false);
    }
  };

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
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.push(`/customers/${customer.id}`)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '0.5rem',
            }}
          >
            ← Back to Customer
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0 0 0' }}>Edit: {customer.name}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Update customer details</p>
        </div>

        {/* Edit Form */}
        <div className="card" style={{ maxWidth: '600px' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Customer Name *
              </label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Phone *
              </label>
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Email
              </label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* City */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                City
              </label>
              <input
                type="text"
                value={editData.city}
                onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Status
              </label>
              <select
                value={editData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'active' })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => router.push(`/customers/${customer.id}`)}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#e2e8f0',
                  color: '#2d3748',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
