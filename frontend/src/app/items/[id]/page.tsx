'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { formatCurrency, formatDate } from '@/services/data.service';

interface Item {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  status: string;
  unitsSold: number;
  lastRestocked: string;
  totalRevenue: number;
  profit?: number;
  profitMargin?: number;
  totalStockValue?: number;
  reorderDays?: number;
}

export default function ViewItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  // Load item
  useEffect(() => {
    const loadItem = () => {
      try {
        // Get items from localStorage
        const storedItems = localStorage.getItem('items_data');
        let items: Item[] = [];

        if (storedItems) {
          try {
            items = JSON.parse(storedItems);
          } catch (e) {
            items = [];
          }
        }

        // Find the item by ID
        const foundItem = items.find((i) => i.id === id);

        if (foundItem) {
          setItem(foundItem);
        } else {
          // Item not found, redirect back
          setTimeout(() => router.push('/items'), 2000);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading item:', error);
        setLoading(false);
      }
    };

    loadItem();
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

  if (!item) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Item Not Found</h2>
          <p>Redirecting back to items...</p>
        </div>
      </MainLayout>
    );
  }

  const getStockColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return { bg: '#c6f6d5', color: '#22543d' };
      case 'Low Stock':
        return { bg: '#feebc8', color: '#7c2d12' };
      case 'Critical':
        return { bg: '#fed7d7', color: '#742a2a' };
      default:
        return { bg: '#e2e8f0', color: '#2d3748' };
    }
  };

  const stockColor = getStockColor(item.status);

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button
              onClick={() => router.push('/items')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                cursor: 'pointer',
                fontSize: '1rem',
                marginBottom: '0.5rem',
              }}
            >
              ← Back to Items
            </button>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0 0 0' }}>{item.name}</h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Item Details & Analytics</p>
          </div>
          <button
            onClick={() => router.push(`/items/${item.id}/edit`)}
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
            ✏️ Edit Item
          </button>
        </div>

        {/* Item Overview Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {/* SKU */}
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>SKU</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{item.sku}</div>
            </div>

            {/* Category */}
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Category</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{item.category}</div>
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
                  background: stockColor.bg,
                  color: stockColor.color,
                  display: 'inline-block',
                }}
              >
                {item.status}
              </span>
            </div>

            {/* Last Restocked */}
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Last Restocked</div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>{formatDate(item.lastRestocked)}</div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Pricing Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Selling Price</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                {formatCurrency(item.price)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Cost Price</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#718096' }}>
                {formatCurrency(item.costPrice)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Profit per Unit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                {formatCurrency(item.profit || 0)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Profit Margin</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f6ad55' }}>{item.profitMargin}%</div>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Stock Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Current Stock</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{item.stock.toLocaleString()}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Reorder Level</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{item.reorderLevel.toLocaleString()}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Stock Value</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#48bb78' }}>
                {formatCurrency(item.totalStockValue || 0)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Days of Stock</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{item.reorderDays || 0} days</div>
            </div>
          </div>
        </div>

        {/* Sales Information */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>Sales Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Units Sold (Monthly)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{item.unitsSold.toLocaleString()}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Total Revenue</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
                {formatCurrency(item.totalRevenue)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={() => router.push(`/items/${item.id}/edit`)}
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
            ✏️ Edit Item
          </button>
          <button
            onClick={() => router.push('/items')}
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
            ← Back to Items
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
