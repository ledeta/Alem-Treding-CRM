'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { buildApiUrl } from '@/lib/api-config';
import { Save, Bell, Mail, Smartphone } from 'lucide-react';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationTypes: {
    payments: boolean;
    approvals: boolean;
    messages: boolean;
    updates: boolean;
    alerts: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    notificationTypes: {
      payments: true,
      approvals: true,
      messages: true,
      updates: true,
      alerts: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    frequency: 'immediate',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadPreferences();
    }
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch(buildApiUrl('/api/notifications/preferences'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(buildApiUrl('/api/notifications/preferences'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        alert('Preferences saved successfully!');
      } else {
        alert('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      alert('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notification Preferences
          </h1>
          <p className="text-gray-600 mt-2">Customize how you receive notifications</p>
        </div>

        <div className="space-y-6">
          {/* Delivery Methods */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Delivery Methods
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      pushNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-gray-600">Receive browser push notifications</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      inAppNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">In-App Notifications</p>
                  <p className="text-sm text-gray-600">Show notifications in the app</p>
                </div>
              </label>
            </div>
          </div>

          {/* Notification Types */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Types</h2>

            <div className="space-y-3">
              {Object.entries(preferences.notificationTypes).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notificationTypes: {
                          ...preferences.notificationTypes,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4"
                  />
                  <p className="font-medium capitalize">{key}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Frequency</h2>

            <select
              value={preferences.frequency}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  frequency: e.target.value as any,
                })
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly Digest</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Digest</option>
            </select>

            <p className="text-sm text-gray-600 mt-2">
              Choose how often you want to receive digest notifications
            </p>
          </div>

          {/* Quiet Hours */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Quiet Hours</h2>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={preferences.quietHours.enabled}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    quietHours: {
                      ...preferences.quietHours,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4"
              />
              <p className="font-medium">Enable Quiet Hours</p>
            </label>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="time"
                    value={preferences.quietHours.startTime}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          startTime: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <input
                    type="time"
                    value={preferences.quietHours.endTime}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        quietHours: {
                          ...preferences.quietHours,
                          endTime: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mt-2">
              During quiet hours, notifications will be silenced or delayed
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
