'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency } from '@/services/data.service';
import { Package } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Item {
  id: number;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stock?: {
    quantity: number;
    lowStockThreshold: number;
  };
  isActive?: boolean;
  createdAt?: string;
}

interface Transaction {
  id: number;
  transactionId: string;
  customer: { id: number; name: string };
  item: { id: number; name: string };
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  branch: string;
  createdBy: { fullName: string };
  transactionDate: string;
  status: string;
}

export default function ItemsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedItemTransactions, setSelectedItemTransactions] = useState<Transaction[]>([]);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    const loadItems = async () => {
      try {
        console.log('🔄 Fetching items from API...');
        const response = await fetch(`${API_URL}/api/items?page=1&limit=999`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const result = await response.json();
        const data = Array.isArray(result) ? result : result.data || [];

        console.log('✅ Loaded', data.length, 'items');

        setItems(data);
        setFilteredItems(data);

        const totalStock = data.reduce((sum: number, i: Item) => sum + (i.stock?.quantity || 0), 0);
        const totalValue = data.reduce((sum: number, i: Item) => sum + (i.sellingPrice * (i.stock?.quantity || 0)), 0);
        const lowStockCount = data.filter((i: Item) => (i.stock?.quantity || 0) <= (i.stock?.lowStockThreshold || 10)).length;
        const avgProfit = data.length > 0 
          ? Math.round(data.reduce((sum: number, i: Item) => sum + ((i.sellingPrice - i.purchasePrice) / i.sellingPrice * 100), 0) / data.length)
          : 0;

        setStats({
          totalItems: data.length,
          totalStock,
          totalValue,
          lowStockCount,
          avgProfit,
        });
      } catch (error) {
        console.error('❌ Error:', error);
        setStats({ totalItems: 0, totalStock: 0, totalValue: 0, lowStockCount: 0, avgProfit: 0 });
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      setFilteredItems(items);
    } else {
      setFilteredItems(
        items.filter((item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          (item.category?.toLowerCase().includes(query) || false)
        )
      );
    }
  }, [searchQuery, items]);

  const loadItemTransactions = async (itemId: number) => {
    setLoadingTransactions(true);
    try {
      const response = await fetch(`${API_URL}/api/transactions/by-item/${itemId}?page=1&limit=1000`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        setSelectedItemTransactions(data);
      } else {
        setSelectedItemTransactions([]);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      setSelectedItemTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleViewItemDetail = async (item: Item) => {
    setSelectedItem(item);
    await loadItemTransactions(item.id);
    setShowDetail(true);
  };

  const getStockStatus = (quantity: number, threshold: number): 'In Stock' | 'Low Stock' | 'Out of Stock' => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= threshold) return 'Low Stock';
    return 'In Stock';
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' => {
    if (status === 'In Stock') return 'success';
    if (status === 'Low Stock') return 'warning';
    return 'danger';
  };

  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'purchasePrice',
      header: 'Purchase Price',
      cell: ({ row }) => formatCurrency(row.getValue('purchasePrice') as number),
    },
    {
      accessorKey: 'sellingPrice',
      header: 'Selling Price',
      cell: ({ row }) => (
        <span className="font-semibold text-secondary">
          {formatCurrency(row.getValue('sellingPrice') as number)}
        </span>
      ),
    },
    {
      id: 'stockQuantity',
      header: 'Stock',
      cell: ({ row }) => <span>{row.original.stock?.quantity || 0}</span>,
    },
    {
      id: 'stockStatus',
      header: 'Status',
      cell: ({ row }) => {
        const item = row.original;
        const status = getStockStatus(item.stock?.quantity || 0, item.stock?.lowStockThreshold || 10);
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => (
        <button
          onClick={() => handleViewItemDetail(row.original)}
          style={{
            background: 'none',
            border: 'none',
            color: '#4299e1',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9rem',
          }}
        >
          View
        </button>
      ),
    },
  ];

  if (loading) {
    return <div className="p-6"><div className="text-gray-500">Loading items...</div></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Items</h1>
        <p className="text-gray-600 text-sm mt-1">Manage inventory and product catalog</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-secondary">{stats?.totalItems || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Stock</p>
            <p className="text-2xl font-bold text-secondary">{stats?.totalStock || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Stock Value</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(stats?.totalValue || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-warning">{stats?.lowStockCount || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Profit Margin</p>
            <p className="text-2xl font-bold text-secondary">{stats?.avgProfit || 0}%</p>
          </CardContent>
        </Card>
      </div>

      <Input
        placeholder="Search by name, SKU, or category..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredItems.length === 0 ? (
        <EmptyState icon={<Package />} title="No items found" description="Items will appear here" />
      ) : (
        <DataTable columns={columns} data={filteredItems} />
      )}

      {/* Item Detail Modal with Transactions */}
      {showDetail && selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            overflow: 'auto',
          }}
          onClick={() => setShowDetail(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '1200px',
              width: '95%',
              margin: '2rem auto',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0 }}>{selectedItem.name}</h2>
              <button
                onClick={() => setShowDetail(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            {/* Item Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>SKU</div>
                <div style={{ fontWeight: '600' }}>{selectedItem.sku}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>Category</div>
                <div style={{ fontWeight: '600' }}>{selectedItem.category}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>Purchase Price</div>
                <div style={{ fontWeight: '600' }}>{formatCurrency(selectedItem.purchasePrice)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.25rem' }}>Selling Price</div>
                <div style={{ fontWeight: '600', color: '#48bb78' }}>{formatCurrency(selectedItem.sellingPrice)}</div>
              </div>
            </div>

            {/* Stock Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ background: '#f7fafc', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Current Stock</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#4299e1' }}>
                  {selectedItem.stock?.quantity || 0}
                </div>
              </div>
              <div style={{ background: '#f7fafc', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Stock Value</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#48bb78' }}>
                  {formatCurrency((selectedItem.stock?.quantity || 0) * selectedItem.sellingPrice)}
                </div>
              </div>
              <div style={{ background: '#f7fafc', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.875rem', color: '#718096', marginBottom: '0.5rem' }}>Low Stock Threshold</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                  {selectedItem.stock?.lowStockThreshold || 0}
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>
                Transaction History ({selectedItemTransactions.length})
              </h3>
              {loadingTransactions ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>Loading transactions...</div>
              ) : selectedItemTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>No transactions found</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Item Name</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Customer</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Quantity</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Selling Price</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Total Amount</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Sold By</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Branch</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItemTransactions.map((tx) => (
                        <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '0.75rem', fontWeight: '600' }}>{tx.item?.name || 'N/A'}</td>
                          <td style={{ padding: '0.75rem', fontWeight: '600' }}>{tx.customer?.name || 'N/A'}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>{tx.quantity}</td>
                          <td style={{ padding: '0.75rem' }}>{formatCurrency(tx.unitPrice)}</td>
                          <td style={{ padding: '0.75rem', fontWeight: '600', color: '#48bb78' }}>{formatCurrency(tx.totalAmount)}</td>
                          <td style={{ padding: '0.75rem' }}>{tx.createdBy?.fullName || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>{tx.branch || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowDetail(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
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
