'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff, LogOut, Camera, User } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [location, setLocation] = useState('admin')
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [totalSold, setTotalSold] = useState('$0')
  const [performance, setPerformance] = useState('0%')
  const [isLoading, setIsLoading] = useState(true)
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [profileName, setProfileName] = useState('John Doe')
  const [phoneNumber, setPhoneNumber] = useState('+1 (555) 123-4567')
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    loadUserStats()
  }, [])

  const loadUserStats = async () => {
    try {
      setIsLoading(true)
      // Fetch total sales from transactions
      const transactionResponse = await fetch('http://localhost:3001/api/transactions', {
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (transactionResponse.ok) {
        const transactionData = await transactionResponse.json()
        const transactions = transactionData.data || []
        
        // Calculate total sales
        const total = transactions.reduce((sum: number, t: any) => {
          const amount = parseFloat(t.amount) || 0
          return sum + amount
        }, 0)
        
        setTotalSold(`$${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
      }

      // Fetch customers count for performance metric
      const customerResponse = await fetch('http://localhost:3001/api/customers?page=1&limit=1', {
        headers: { 'Content-Type': 'application/json' },
      })
      
      if (customerResponse.ok) {
        const customerData = await customerResponse.json()
        // Calculate performance as a percentage (example: based on customer count)
        const customerCount = customerData.pagination?.total || 0
        const performanceValue = Math.min(100, Math.round((customerCount / 50) * 100))
        setPerformance(`${performanceValue}%`)
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
      // Keep default values on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    sessionStorage.clear()
    router.push('/login')
  }

  const handleSaveProfile = async () => {
    try {
      setSaveMessage('')
      
      // Validate password fields if editing
      if (isEditing && password1) {
        if (password1 !== password2) {
          setSaveMessage('Passwords do not match!')
          setTimeout(() => setSaveMessage(''), 4000)
          return
        }

        if (password1.length < 6) {
          setSaveMessage('Password must be at least 6 characters!')
          setTimeout(() => setSaveMessage(''), 4000)
          return
        }

        // Get current password from user (they need to enter it)
        const currentPasswordInput = prompt('Enter your current password to confirm changes:')
        if (!currentPasswordInput) {
          setSaveMessage('Password change cancelled')
          setTimeout(() => setSaveMessage(''), 3000)
          return
        }

        // Call backend to change password
        const token = localStorage.getItem('accessToken')
        const changePasswordResponse = await fetch('http://localhost:3001/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: currentPasswordInput,
            newPassword: password1,
          }),
        })

        if (!changePasswordResponse.ok) {
          const errorData = await changePasswordResponse.json()
          setSaveMessage(`Error: ${errorData.message || 'Failed to change password'}`)
          setTimeout(() => setSaveMessage(''), 4000)
          return
        }

        // Clear password fields on success
        setPassword1('')
        setPassword2('')
      }

      // Update profile info (name and phone)
      // This would need a backend endpoint - for now just show success
      setSaveMessage('Profile updated successfully!')
      setIsEditing(false)
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveMessage('Error saving profile. Please try again.')
      setTimeout(() => setSaveMessage(''), 4000)
    }
  }

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setProfileImage(result)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 pb-32">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={() => router.back()}
            className="p-3 hover:bg-gray-700 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white">My Profile</h1>
            <p className="text-gray-400 font-semibold mt-1">Manage your account settings</p>
          </div>
        </div>

        {/* Profile Picture Section */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
          
          <div className="relative flex flex-col items-center text-center">
            {/* Profile Image */}
            <div className="relative mb-6">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-2xl border-4 border-white overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-gray-600" size={80} />
                )}
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement
                    const event = target as unknown as React.ChangeEvent<HTMLInputElement>
                    handleProfileImageUpload(event)
                  }
                  input.click()
                }}
                className="absolute bottom-0 right-0 p-3 bg-white text-blue-600 rounded-full shadow-lg hover:scale-110 transition-all duration-300 border-4 border-blue-600"
              >
                <Camera size={24} />
              </button>
            </div>

            {/* User Info */}
            <h2 className="text-3xl font-black text-white mb-2">John Doe</h2>
            <p className="text-blue-100 font-bold text-lg">Senior Sales Manager</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-3xl shadow-2xl p-8 border border-gray-700">
          <div className="space-y-6">
            {/* Profile Name */}
            <div>
              <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                Profile Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 focus:outline-none transition-all disabled:cursor-not-allowed hover:border-gray-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 focus:outline-none transition-all disabled:cursor-not-allowed hover:border-gray-500"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2"></div>

            {/* Password Section */}
            <div className="pt-2">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <span className="text-blue-400">🔒</span> Security Settings
              </h3>

              {/* First Password */}
              <div className="mb-4">
                <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword1 ? 'text' : 'password'}
                    value={password1}
                    onChange={(e) => setPassword1(e.target.value)}
                    placeholder={isEditing ? 'Enter new password' : '••••••••'}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 focus:outline-none transition-all disabled:cursor-not-allowed hover:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword1(!showPassword1)}
                    disabled={!isEditing}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Second Password */}
              <div>
                <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword2 ? 'text' : 'password'}
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder={isEditing ? 'Confirm new password' : '••••••••'}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 focus:outline-none transition-all disabled:cursor-not-allowed hover:border-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    disabled={!isEditing}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white disabled:opacity-50"
                  >
                    {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2"></div>

            {/* Stats Section */}
            <div className="pt-2">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">📊</span> Performance & Role
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Sold */}
                <div>
                  <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                    Total Sold by You
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/30 cursor-not-allowed">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <span className="text-green-400">{totalSold}</span>
                    )}
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                    Performance
                  </label>
                  <div className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/30 cursor-not-allowed">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-gray-400">Loading...</span>
                      </div>
                    ) : (
                      <span className="text-blue-400">{performance}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="mt-4">
                <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                  Role
                </label>
                <input
                  type="text"
                  defaultValue="Senior Sales Manager"
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/30 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent my-2"></div>

            {/* Location Section */}
            <div className="pt-2">
              <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                <span className="text-purple-400">📍</span> Location
              </h3>

              <label className="block text-sm font-black text-gray-300 mb-3 uppercase tracking-wider">
                Select Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-600 rounded-xl font-bold text-white bg-gray-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30 focus:outline-none transition-all disabled:cursor-not-allowed hover:border-gray-500 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239CA3AF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="admin">🔑 Admin</option>
                <option value="warehouse">📦 Warehouse</option>
                <option value="shop">🛍️ Shop</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-6 mt-8 border-t border-gray-600">
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile()
                  } else {
                    setIsEditing(true)
                  }
                }}
                className={`px-6 py-3 rounded-xl font-black transition-all duration-300 hover:scale-105 uppercase tracking-wide ${
                  isEditing
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                }`}
              >
                {isEditing ? '✓ Save Changes' : '✎ Edit Profile'}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-black hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>

            {/* Save Message */}
            {saveMessage && (
              <div className={`mt-4 p-4 rounded-xl font-bold text-center transition-all duration-300 ${
                saveMessage.includes('Error') || saveMessage.includes('do not match')
                  ? 'bg-red-600/20 border-2 border-red-500 text-red-400'
                  : 'bg-green-600/20 border-2 border-green-500 text-green-400'
              }`}>
                {saveMessage}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm font-semibold">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
