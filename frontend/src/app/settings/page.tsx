'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { buildApiUrl } from '@/lib/api-config';

interface Settings {
  twoFactorEnabled: boolean;
  apiKeysCount: number;
  webhooksCount: number;
  lastLogin: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'security' | 'api' | 'webhooks'>('security');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleSetup2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/2fa/setup'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert('2FA Setup Complete! Backup codes: ' + data.backupCodes.join(', '));
      }
    } catch (error) {
      console.error('2FA setup failed:', error);
      alert('Failed to setup 2FA');
    }
  };

  const handleGenerateAPIKey = async () => {
    const name = prompt('Enter API Key name:');
    if (!name) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('/api/api-keys/generate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          scopes: ['read', 'write'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`API Key generated:\n${data.apiKey.token}\n\nStore this safely!`);
      }
    } catch (error) {
      console.error('API key generation failed:', error);
      alert('Failed to generate API key');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading settings...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Settings</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'security' ? '#b8860b' : '#718096',
              fontWeight: activeTab === 'security' ? '600' : '400',
              cursor: 'pointer',
              borderBottom: activeTab === 'security' ? '3px solid #b8860b' : 'none',
              marginBottom: '-2px',
            }}
          >
            🔒 Security
          </button>
          <button
            onClick={() => setActiveTab('api')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'api' ? '#b8860b' : '#718096',
              fontWeight: activeTab === 'api' ? '600' : '400',
              cursor: 'pointer',
              borderBottom: activeTab === 'api' ? '3px solid #b8860b' : 'none',
              marginBottom: '-2px',
            }}
          >
            🔑 API Keys
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'webhooks' ? '#b8860b' : '#718096',
              fontWeight: activeTab === 'webhooks' ? '600' : '400',
              cursor: 'pointer',
              borderBottom: activeTab === 'webhooks' ? '3px solid #b8860b' : 'none',
              marginBottom: '-2px',
            }}
          >
            🪝 Webhooks
          </button>
        </div>

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Security Settings</h2>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>Two-Factor Authentication</h3>
              <p style={{ color: '#718096', marginBottom: '1rem' }}>
                Add an extra layer of security to your account using an authenticator app.
              </p>
              <button
                onClick={handleSetup2FA}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Setup 2FA
              </button>
            </div>

            <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f7fafc', borderRadius: '8px', borderLeft: '4px solid #b8860b' }}>
              <p style={{ color: '#4a5568', margin: 0 }}>
                <strong>User:</strong> {user?.username}
              </p>
              <p style={{ color: '#4a5568', margin: '0.5rem 0 0 0' }}>
                <strong>Role:</strong> {user?.role}
              </p>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>API Keys</h2>
              <button
                onClick={handleGenerateAPIKey}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + Generate New Key
              </button>
            </div>

            <p style={{ color: '#718096', marginBottom: '1rem' }}>
              Create API keys for programmatic access to ALEM TRADING. Store them safely - you won't see them again.
            </p>

            <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', textAlign: 'center', color: '#718096' }}>
              <p>No API keys created yet.</p>
              <p style={{ fontSize: '0.875rem' }}>Click "Generate New Key" to create one.</p>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Webhooks</h2>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                + Register Webhook
              </button>
            </div>

            <p style={{ color: '#718096', marginBottom: '1rem' }}>
              Register webhooks to receive real-time notifications about events in ALEM TRADING.
            </p>

            <div style={{ padding: '1rem', background: '#f7fafc', borderRadius: '8px', textAlign: 'center', color: '#718096' }}>
              <p>No webhooks registered yet.</p>
              <p style={{ fontSize: '0.875rem' }}>Click "Register Webhook" to get started.</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
