'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { buildApiUrl } from '@/lib/api-config';
import { Send, Users, Trash2, Filter, Search } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval';
  createdAt: Date;
}

interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  byType: Record<string, number>;
}

export default function NotificationsAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [selectedType, setSelectedType] = useState<'all' | 'info' | 'success' | 'warning' | 'error' | 'approval'>('all');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    recipients: 'all' as const,
    recipientIds: '' as string,
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      if (parsed.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(parsed);
    }
  }, [router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadStats();
      loadTemplates();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/notifications/stats'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/notifications/templates'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data || []);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        recipients: formData.recipients === 'all' 
          ? 'all' 
          : formData.recipientIds.split(',').map((id) => parseInt(id.trim())),
      };

      const response = await fetch(buildApiUrl('/api/notifications/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({
          title: '',
          message: '',
          type: 'info',
          recipients: 'all',
          recipientIds: '',
        });
        loadStats();
        alert('Notification sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      alert('Failed to send notification');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Delete this template?')) return;

    try {
      const response = await fetch(
        buildApiUrl(`/notifications/templates/${templateId}`),
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-red-600">Access denied. Admin only.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications Admin</h1>
            <p className="text-gray-600 mt-2">Send and manage system notifications</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send Notification
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <p className="text-sm text-gray-600">By Type</p>
              <div className="mt-2 space-y-1 text-xs">
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between">
                    <span>{type}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Templates */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Templates ({templates.length})
            </h2>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No templates</div>
            ) : (
              templates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{template.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{template.message}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          template.type === 'success' ? 'bg-green-100 text-green-700' :
                          template.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          template.type === 'error' ? 'bg-red-100 text-red-700' :
                          template.type === 'approval' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {template.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6 border-b">
                <h2 className="text-lg font-bold">Send Notification</h2>
              </div>

              <form onSubmit={handleSendNotification} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Notification message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="approval">Approval</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Recipients</label>
                  <select
                    value={formData.recipients}
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="specific">Specific Users</option>
                  </select>
                </div>

                {formData.recipients === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">User IDs (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.recipientIds}
                      onChange={(e) => setFormData({ ...formData, recipientIds: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1, 2, 3"
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

