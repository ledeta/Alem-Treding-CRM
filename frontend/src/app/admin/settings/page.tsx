'use client'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { Alert } from '@/components/ui/Alert'
import { useState } from 'react'
import { useApiPost } from '@/hooks/useApi'
import { Settings, Lock, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'ALEM CRM',
    email: 'contact@alemcrm.com',
    phone: '+251-911-123-456',
    address: 'Addis Ababa, Ethiopia',
    timezone: 'Africa/Addis_Ababa',
    currency: 'ETB',
    lowStockThreshold: 10,
    inactivityDays: 15,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    approvalReminders: true,
    weeklyReports: true,
  })

  const updateMutation = useApiPost('/settings', {
    onSuccess: () => toast.success('Settings updated'),
  })

  const passwordMutation = useApiPost('/auth/change-password', {
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    },
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const handleNotificationChange = (key: string) => {
    setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })
  }

  const handleSaveSettings = () => {
    updateMutation.mutate(settings)
  }

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    passwordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })
  }

  const tabs = [
    {
      id: 'general',
      label: 'General',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings size={20} />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Company Name"
                value={settings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
              <Input
                label="Email Address"
                type="email"
                value={settings.email}
                onChange={(e) => handleSettingChange('email', e.target.value)}
              />
              <Input
                label="Phone Number"
                value={settings.phone}
                onChange={(e) => handleSettingChange('phone', e.target.value)}
              />
              <Input
                label="Address"
                value={settings.address}
                onChange={(e) => handleSettingChange('address', e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="Timezone"
                value={settings.timezone}
                onChange={(e) => handleSettingChange('timezone', e.target.value)}
                options={[
                  { label: 'Africa/Addis Ababa', value: 'Africa/Addis_Ababa' },
                  { label: 'UTC', value: 'UTC' },
                  { label: 'UTC+3', value: 'EAT' },
                ]}
              />
              <Select
                label="Currency"
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
                options={[
                  { label: 'ETB (Ethiopian Birr)', value: 'ETB' },
                  { label: 'USD (US Dollar)', value: 'USD' },
                  { label: 'EUR (Euro)', value: 'EUR' },
                ]}
              />
              <Input
                label="Low Stock Threshold"
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
                hint="Alert when stock level falls below this number"
              />
              <Input
                label="Inactivity Days"
                type="number"
                value={settings.inactivityDays}
                onChange={(e) => handleSettingChange('inactivityDays', parseInt(e.target.value))}
                hint="Days before a customer is marked as inactive"
              />
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveSettings}
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      ),
    },
    {
      id: 'security',
      label: 'Security',
      content: (
        <div className="space-y-6">
          <Alert variant="info" title="Password Security">
            Keep your password strong and unique. Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols.
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock size={20} />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              />
              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
              <Input
                label="Confirm Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
              <Button
                onClick={handleChangePassword}
                disabled={passwordMutation.isPending}
                className="w-full"
              >
                {passwordMutation.isPending ? 'Updating...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      content: (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={() => handleNotificationChange('emailNotifications')}
                  className="w-5 h-5 rounded border-gray-300 text-secondary"
                />
                <span>Email Notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.lowStockAlerts}
                  onChange={() => handleNotificationChange('lowStockAlerts')}
                  className="w-5 h-5 rounded border-gray-300 text-secondary"
                />
                <span>Low Stock Alerts</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.approvalReminders}
                  onChange={() => handleNotificationChange('approvalReminders')}
                  className="w-5 h-5 rounded border-gray-300 text-secondary"
                />
                <span>Approval Reminders</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.weeklyReports}
                  onChange={() => handleNotificationChange('weeklyReports')}
                  className="w-5 h-5 rounded border-gray-300 text-secondary"
                />
                <span>Weekly Reports</span>
              </label>

              <Button className="w-full mt-4" variant="secondary">
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-gray-600 text-sm mt-1">Manage system settings and preferences</p>
      </div>

      <Tabs tabs={tabs} defaultTab="general" />
    </div>
  )
}


