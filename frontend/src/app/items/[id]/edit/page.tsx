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

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    sku: '',
    category: 'Accessories',
    price: 0,
    costPrice: 0,
    stock: 0,
    reorderLevel: 10,
    unitsSold: 0,
  });

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
          setEditData({
            name: foundItem.name,
            sku: foundItem.sku,
            category: foundItem.category,
            price: foundItem.price,
            costPrice: foundItem.costPrice,
            stock: foundItem.stock,
            reorderLevel: foundItem.reorderLevel,
            unitsSold: foundItem.unitsSold,
          });
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

  const handleSave = () => {
    if (!editData.name.trim() || !editData.sku.trim()) {
      alert('Please fill in Name and SKU');
      return;
    }

    setSaving(true);

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

      // Find and update the item
      const itemIndex = items.findIndex((i) => i.id === id);

      if (itemIndex >= 0) {
        const profit = editData.price - editData.costPrice;
        const profitMargin = editData.price > 0 ? Math.round(((editData.price - editData.costPrice) / editData.price) * 100) : 0;

        items[itemIndex] = {
          ...items[itemIndex],
          ...editData,
          profit,
          profitMargin,
          totalStockValue: editData.price * editData.stock,
          reorderDays: editData.stock > 0 ? Math.ceil((editData.stock / (editData.unitsSold || 1)) * 30) : 0,
          status: editData.stock > editData.reorderLevel ? 'In Stock' : editData.stock > 0 ? 'Low Stock' : 'Critical',
        };

        // Save to localStorage
        localStorage.setItem('items_data', JSON.stringify(items));

        alert('Item updated successfully!');
        setTimeout(() => router.push(`/items/${id}`), 500);
      }

      setSaving(false);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item');
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

  return (
    <MainLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            onClick={() => router.push(`/items/${item.id}`)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '0.5rem',
            }}
          >
            ← Back to Item
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0 0 0' }}>Edit: {item.name}</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>Update item details</p>
        </div>

        {/* Edit Form */}
        <div className="card" style={{ maxWidth: '600px' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Item Name *
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

            {/* SKU */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                SKU *
              </label>
              <input
                type="text"
                value={editData.sku}
                onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
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

            {/* Category */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Category
              </label>
              <select
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              >
                <option>Accessories</option>
                <option>Electronics</option>
                <option>Screen</option>
                <option>Other</option>
              </select>
            </div>

            {/* Price and Cost */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Selling Price (ብር)
                </label>
                <input
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) || 0 })}
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
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Cost Price (ብር)
                </label>
                <input
                  type="number"
                  value={editData.costPrice}
                  onChange={(e) => setEditData({ ...editData, costPrice: parseFloat(e.target.value) || 0 })}
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
            </div>

            {/* Stock and Reorder */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={editData.stock}
                  onChange={(e) => setEditData({ ...editData, stock: parseFloat(e.target.value) || 0 })}
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
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                  Reorder Level
                </label>
                <input
                  type="number"
                  value={editData.reorderLevel}
                  onChange={(e) => setEditData({ ...editData, reorderLevel: parseFloat(e.target.value) || 0 })}
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
            </div>

            {/* Units Sold */}
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Units Sold (Monthly)
              </label>
              <input
                type="number"
                value={editData.unitsSold}
                onChange={(e) => setEditData({ ...editData, unitsSold: parseFloat(e.target.value) || 0 })}
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

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <button
                onClick={() => router.push(`/items/${item.id}`)}
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
