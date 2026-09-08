'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SearchResult {
  type: 'customer' | 'item' | 'transaction';
  id: number;
  title: string;
  subtitle: string;
  path: string;
}

export default function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      console.log('🔍 Searching for:', searchQuery);
      
      // Search actual API data
      const lowerQuery = searchQuery.toLowerCase();
      const results: SearchResult[] = [];

      // Search customers
      try {
        const custResponse = await fetch(`${API_URL}/api/customers?page=1&limit=1000`, {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (custResponse.ok) {
          const custData = await custResponse.json();
          const customers = custData.data || [];
          
          customers.forEach((customer: any) => {
            if (
              customer.name?.toLowerCase().includes(lowerQuery) ||
              customer.phone?.includes(searchQuery) ||
              customer.email?.toLowerCase().includes(lowerQuery) ||
              customer.city?.toLowerCase().includes(lowerQuery)
            ) {
              results.push({
                type: 'customer',
                id: customer.id,
                title: customer.name,
                subtitle: customer.phone || customer.email || 'No contact',
                path: `/customers/${customer.id}`,
              });
            }
          });
        }
      } catch (error) {
        console.error('❌ Customer search error:', error);
      }

      // Search items
      try {
        const itemResponse = await fetch(`${API_URL}/api/items?page=1&limit=1000`, {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (itemResponse.ok) {
          const itemData = await itemResponse.json();
          const items = itemData.data || [];
          
          items.forEach((item: any) => {
            if (
              item.name?.toLowerCase().includes(lowerQuery) ||
              item.sku?.includes(searchQuery)
            ) {
              results.push({
                type: 'item',
                id: item.id,
                title: item.name,
                subtitle: `SKU: ${item.sku || 'N/A'}`,
                path: `/items/${item.id}`,
              });
            }
          });
        }
      } catch (error) {
        console.error('❌ Item search error:', error);
      }

      // Search transactions
      try {
        const txResponse = await fetch(`${API_URL}/api/transactions?page=1&limit=1000`, {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (txResponse.ok) {
          const txData = await txResponse.json();
          const transactions = txData.data || [];
          
          transactions.forEach((tx: any) => {
            if (
              tx.transactionId?.includes(searchQuery) ||
              tx.customerName?.toLowerCase().includes(lowerQuery)
            ) {
              results.push({
                type: 'transaction',
                id: tx.id,
                title: `Transaction #${tx.transactionId}`,
                subtitle: `${tx.customerName} - ብር ${tx.totalAmount?.toLocaleString() || '0'}`,
                path: `/transactions/${tx.id}`,
              });
            }
          });
        }
      } catch (error) {
        console.error('❌ Transaction search error:', error);
      }

      console.log('✅ Search results found:', results.length);
      setResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    router.push(result.path);
    setQuery('');
    setShowResults(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return '👤';
      case 'item':
        return '📦';
      case 'transaction':
        return '💰';
      default:
        return '🔍';
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }} ref={searchRef}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search customers, items, transactions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 3rem',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        <span
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.25rem',
          }}
        >
          🔍
        </span>
        {loading && (
          <div
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <div className="spinner spinner-sm" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000,
          }}
          className="animate-slideIn"
        >
          {results.map((result) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelectResult(result)}
              style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: '1.5rem' }}>{getIcon(result.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  {result.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {result.subtitle}
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {result.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && !loading && query.length >= 2 && results.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-xl)',
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            zIndex: 1000,
          }}
          className="animate-slideIn"
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
          <div>No results found for "{query}"</div>
        </div>
      )}
    </div>
  );
}
