'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminBottomNav from '@/components/AdminBottomNav'
import { Users, Edit2, Trash2, Search, Plus, Eye, EyeOff, AlertCircle, LogOut } from 'lucide-react'

const ADMIN_FEATURES = [
  { id: 'dashboard', label: 'Dashboard & Analytics', category: 'Viewing' },
  { id: 'users', label: 'User Management', category: 'Administration' },
  { id: 'customers', label: 'Customer Management', category: 'Viewing' },
  { id: 'payments', label: 'Payment Processing', category: 'Transactions' },
  { id: 'reports', label: 'Generate Reports', category: 'Reporting' },
  { id: 'settings', label: 'System Settings', category: 'Administration' },
  { id: 'audit', label: 'Audit Logs', category: 'Administration' },
  { id: 'transactions', label: 'Transaction Management', category: 'Transactions' },
]

const SALES_FEATURES = [
  { id: 'dashboard', label: 'Sales Dashboard', category: 'Viewing' },
  { id: 'customers', label: 'View Customers', category: 'Viewing' },
  { id: 'add_sale', label: 'Add New Sale', category: 'Sales' },
  { id: 'view_sales', label: 'View Sales History', category: 'Viewing' },
  { id: 'payments', label: 'Receive Payments', category: 'Transactions' },
  { id: 'export', label: 'Export Data', category: 'Reporting' },
  { id: 'items', label: 'Manage Items', category: 'Inventory' },
]

interface User {
  id: string
  username: string
  fullName: string
  phone: string
  role: 'admin' | 'sales'
  status: 'active' | 'suspended'
  createdAt: string
  tasks: string[]
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    fullName: 'System Administrator',
    phone: '+251911223344',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tasks: ['dashboard', 'users', 'customers', 'payments', 'reports', 'settings', 'audit', 'transactions', 'dashboard', 'customers', 'add_sale', 'view_sales', 'payments', 'export', 'items'],
  },
  {
    id: '2',
    username: 'sales',
    fullName: 'Sales Representative',
    phone: '+251922334455',
    role: 'sales',
    status: 'active',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    tasks: ['dashboard', 'users', 'customers', 'payments', 'reports', 'settings', 'audit', 'transactions', 'dashboard', 'customers', 'add_sale', 'view_sales', 'payments', 'export', 'items'],
  },
  {
    id: '3',
    username: 'million',
    fullName: 'Million Tiruneh',
    phone: '+251945822091',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    tasks: ['dashboard', 'users', 'customers', 'payments', 'reports', 'settings', 'audit', 'transactions', 'dashboard', 'customers', 'add_sale', 'view_sales', 'payments', 'export', 'items'],
  },
]

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  // Get all feature IDs for default permissions
  const getAllFeatureIds = () => {
    return [...ADMIN_FEATURES, ...SALES_FEATURES].map(f => f.id)
  }
  
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    phone: '',
    role: 'sales' as 'admin' | 'sales',
    password1: '',
    password2: '',
    tasks: getAllFeatureIds(), // SELECT ALL PERMISSIONS BY DEFAULT
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userFullName')
    router.push('/login')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // LOAD USERS FROM LOCALSTORAGE INSTEAD OF MOCK_USERS
    let loadedUsers: User[] = []
    try {
      const storedData = localStorage.getItem('users_data')
      if (storedData) {
        const parsedUsers = JSON.parse(storedData)
        if (Array.isArray(parsedUsers)) {
          loadedUsers = parsedUsers.map((u: any, idx: number) => ({
            id: u.id || String(idx + 1),
            username: u.username,
            fullName: u.fullName,
            phone: u.phone,
            role: u.role || 'sales',
            status: u.status || 'active',
            createdAt: u.createdAt || new Date().toISOString(),
            tasks: getAllFeatureIds(), // ALWAYS ASSIGN ALL PERMISSIONS
          }))
          console.log('✅ Loaded users from localStorage:', loadedUsers)
        }
      }
    } catch (e) {
      console.error('❌ Error loading users from localStorage:', e)
      loadedUsers = MOCK_USERS
    }

    // If no stored users, use MOCK_USERS as fallback
    if (loadedUsers.length === 0) {
      loadedUsers = MOCK_USERS
    }

    setUsers(loadedUsers)
    setFilteredUsers(loadedUsers)
    setIsLoading(false)
  }, [router])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users)
    } else {
      const lowerSearch = searchTerm.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.fullName.toLowerCase().includes(lowerSearch) ||
            user.username.toLowerCase().includes(lowerSearch) ||
            user.phone.includes(searchTerm)
        )
      )
    }
  }, [searchTerm, users])

  const handleAddUser = () => {
    setPasswordError('')

    // Validate required fields
    if (!newUser.username.trim() || !newUser.fullName.trim() || !newUser.phone.trim() || !newUser.password1.trim()) {
      setPasswordError('Please fill in all required fields')
      return
    }

    // Validate password length
    if (newUser.password1.length < 6) {
      setPasswordError('1st password must be at least 6 characters long')
      return
    }

    // If 2nd password is provided, validate length
    if (newUser.password2.trim() && newUser.password2.length < 6) {
      setPasswordError('2nd password must be at least 6 characters long')
      return
    }

    const newUserObj: User = {
      id: String(users.length + 1),
      username: newUser.username,
      fullName: newUser.fullName,
      phone: newUser.phone,
      role: newUser.role,
      status: 'active',
      createdAt: new Date().toISOString(),
      tasks: newUser.tasks,
    }

    const updatedUsers = [...users, newUserObj]
    setUsers(updatedUsers)
    setFilteredUsers(updatedUsers)

    // SAVE USER WITH PASSWORDS TO LOCALSTORAGE FOR LOGIN
    const usersDataStr = localStorage.getItem('users_data')
    let usersData = []
    try {
      usersData = usersDataStr ? JSON.parse(usersDataStr) : []
    } catch (e) {
      usersData = []
    }

    // Add new user with passwords
    usersData.push({
      id: newUserObj.id,
      username: newUser.username,
      fullName: newUser.fullName,
      phone: newUser.phone,
      role: newUser.role,
      password1: newUser.password1, // 1st password for login
      password2: newUser.password2 || newUser.password1, // 2nd password (or same as 1st if not provided)
      tasks: newUser.tasks,
    })

    localStorage.setItem('users_data', JSON.stringify(usersData))
    console.log('✅ User saved to localStorage:', { username: newUser.username, password1: newUser.password1, password2: newUser.password2 })
    console.log('📦 Complete users_data:', usersData)

    setNewUser({ username: '', fullName: '', phone: '', role: 'sales', password1: '', password2: '', tasks: getAllFeatureIds() })
    setShowPassword1(false)
    setShowPassword2(false)
    setShowAddModal(false)
    alert(`✅ User created!\n\nUsername: ${newUser.username}\n1st Password: ${newUser.password1}\n2nd Password: ${newUser.password2}\n\nYou can now login on the login page!`)
  }

  const handleTaskToggle = (taskId: string) => {
    setNewUser((prev) => ({
      ...prev,
      tasks: prev.tasks.includes(taskId)
        ? prev.tasks.filter((t) => t !== taskId)
        : [...prev.tasks, taskId],
    }))
  }

  const handleSuspendUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const updatedUsers = users.map((u) =>
      u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' as 'suspended' | 'active' } : u
    )
    setUsers(updatedUsers)
    setFilteredUsers(updatedUsers)
  }

  const handleEditUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return
    
    setEditingUserId(userId)
    setNewUser({
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      password1: '',
      password2: '',
      tasks: getAllFeatureIds(), // ALWAYS SET ALL PERMISSIONS
    })
    setShowEditModal(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const userToDelete = users.find(u => u.id === userId)
      const updatedUsers = users.filter((u) => u.id !== userId)
      setUsers(updatedUsers)
      setFilteredUsers(updatedUsers)
      
      // REMOVE USER FROM LOCALSTORAGE
      let usersData = []
      try {
        const storedData = localStorage.getItem('users_data')
        if (storedData) {
          usersData = JSON.parse(storedData)
        }
      } catch (e) {
        usersData = []
      }
      
      // Filter out the deleted user
      usersData = usersData.filter((u: any) => u.username !== userToDelete?.username)
      localStorage.setItem('users_data', JSON.stringify(usersData))
      console.log('✅ User deleted from localStorage:', userToDelete?.username)
      
      alert('User deleted successfully!')
    }
  }

  const handleUpdateUser = () => {
    setPasswordError('')

    // Validate required fields
    if (!newUser.username.trim() || !newUser.fullName.trim() || !newUser.phone.trim()) {
      setPasswordError('Please fill in all required fields')
      return
    }

    // If password is provided, validate it
    if (newUser.password1.trim()) {
      if (newUser.password1.length < 6) {
        setPasswordError('1st password must be at least 6 characters long')
        return
      }

      if (newUser.password2.trim() && newUser.password2.length < 6) {
        setPasswordError('2nd password must be at least 6 characters long')
        return
      }
    }

    const updatedUsers = users.map((u) =>
      u.id === editingUserId
        ? {
            ...u,
            username: newUser.username,
            fullName: newUser.fullName,
            phone: newUser.phone,
            role: newUser.role,
            tasks: newUser.tasks,
          }
        : u
    )

    setUsers(updatedUsers)
    setFilteredUsers(updatedUsers)

    // UPDATE USER IN LOCALSTORAGE
    let usersData = []
    try {
      const storedData = localStorage.getItem('users_data')
      if (storedData) {
        usersData = JSON.parse(storedData)
      }
    } catch (e) {
      usersData = []
    }

    // Find and update the user in localStorage
    const existingUserIndex = usersData.findIndex((u: any) => u.id === editingUserId)
    if (existingUserIndex >= 0) {
      usersData[existingUserIndex] = {
        ...usersData[existingUserIndex],
        username: newUser.username,
        fullName: newUser.fullName,
        phone: newUser.phone,
        role: newUser.role,
        // Update passwords if provided
        ...(newUser.password1 && { password1: newUser.password1 }),
        ...(newUser.password2 && { password2: newUser.password2 }),
        tasks: newUser.tasks,
      }
    }

    localStorage.setItem('users_data', JSON.stringify(usersData))
    console.log('✅ User updated in localStorage')

    setNewUser({ username: '', fullName: '', phone: '', role: 'sales', password1: '', password2: '', tasks: getAllFeatureIds() })
    setShowPassword1(false)
    setShowPassword2(false)
    setShowEditModal(false)
    setEditingUserId(null)
    alert('User updated successfully!')
  }

  const getFeatureList = () => {
    // Return ALL features (both admin and sales) for all users
    return [...ADMIN_FEATURES, ...SALES_FEATURES]
  }

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <>
      <div style={{ 
        padding: '0.75rem', 
        paddingBottom: '100px', 
        minHeight: '100vh', 
        background: '#f5f7fa',
        width: '100%',
        overflowX: 'hidden',
        margin: 0,
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '0.75rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.5rem',
          width: '100%',
        }}>
          <div style={{ minWidth: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
              <Users size={18} strokeWidth={2} style={{ color: '#1B4FA5', flexShrink: 0 }} />
              <h1 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1B4FA5', margin: 0 }}>Users</h1>
            </div>
            <p style={{ margin: 0, color: '#718096', fontSize: '0.75rem' }}>Total: {filteredUsers.length} users</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.7rem',
              background: 'linear-gradient(135deg, #0F3460 0%, #1B4FA5 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(27, 79, 165, 0.15)',
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(27, 79, 165, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(27, 79, 165, 0.15)';
            }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>

        {/* Logout Section */}
        <div style={{
          background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
          borderRadius: '12px',
          border: '2px solid #e9d5ff',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 8px rgba(168, 85, 247, 0.08)',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '0' }}>
            <LogOut size={18} strokeWidth={2.5} style={{ color: '#a855f7', flexShrink: 0 }} />
            <div style={{ minWidth: '0' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#7c3aed', margin: 0 }}>Account & Security</h3>
              <p style={{ fontSize: '0.75rem', color: '#9333ea', margin: '0.25rem 0 0 0' }}>Logout from your account</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              padding: '0.625rem 1.25rem',
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(168, 85, 247, 0.25)',
              flexShrink: 0,
              letterSpacing: '0.2px',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.25)';
            }}
          >
            <LogOut size={16} strokeWidth={2.5} />
            Logout
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#718096',
            }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem 0.625rem 2.5rem',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '0.8rem',
                background: 'white',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Users Grid Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.875rem',
        }}>
          {filteredUsers.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#718096' }}>
              <Users size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '0.875rem',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.06)';
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  margin: '0 auto 0.625rem',
                }}>
                  {user.fullName.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                <div style={{ marginBottom: '0.625rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2d3748', textAlign: 'center', marginBottom: '0.25rem' }}>
                    {user.fullName.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#718096', textAlign: 'center', marginBottom: '0.375rem' }}>
                    @{user.username}
                  </div>
                </div>

                {/* Role & Status */}
                <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '0.625rem' }}>
                  <span style={{
                    flex: 1,
                    padding: '0.25rem 0.375rem',
                    background: user.role === 'admin' ? '#dbeafe' : '#dcfce7',
                    color: user.role === 'admin' ? '#1e40af' : '#166534',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    textAlign: 'center',
                    textTransform: 'capitalize',
                  }}>
                    {user.role}
                  </span>
                  <span style={{
                    flex: 1,
                    padding: '0.25rem 0.375rem',
                    background: user.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: user.status === 'active' ? '#166534' : '#991b1b',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    {user.status === 'active' ? '●' : '○'} {user.status === 'active' ? 'Active' : 'Suspend'}
                  </span>
                </div>

                {/* Phone */}
                <div style={{ fontSize: '0.7rem', color: '#718096', textAlign: 'center', marginBottom: '0.625rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.phone}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.375rem', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button
                      onClick={() => handleEditUser(user.id)}
                      style={{
                        flex: 1,
                        padding: '0.375rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#bfdbfe'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      style={{
                        flex: 1,
                        padding: '0.375rem',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fecaca'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                    >
                      <Trash2 size={12} />
                      Del
                    </button>
                  </div>
                  <button
                    onClick={() => handleSuspendUser(user.id)}
                    style={{
                      width: '100%',
                      padding: '0.375rem',
                      background: user.status === 'active' ? '#fef3c7' : '#dcfce7',
                      color: user.status === 'active' ? '#92400e' : '#166534',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = user.status === 'active' ? '#fcd34d' : '#bbf7d0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = user.status === 'active' ? '#fef3c7' : '#dcfce7';
                    }}
                  >
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add User Modal - Professional Enhanced Version */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto',
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            width: '100%',
            maxWidth: '600px',
            overflow: 'hidden',
            margin: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header - Premium Enterprise Style */}
            <div style={{
              background: 'linear-gradient(135deg, #0F3460 0%, #1B4FA5 50%, #16366d 100%)',
              padding: '2.5rem 2rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: 'none',
              boxShadow: '0 4px 6px rgba(15, 52, 96, 0.15)',
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.75rem', 
                  fontWeight: '900', 
                  letterSpacing: '-0.7px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>Create New User</h2>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.85rem', 
                  opacity: 0.9,
                  fontWeight: '400'
                }}>Set up a new team member account</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >✕</button>
            </div>

            {/* Modal Body - Professional Layout */}
            <div style={{ 
              padding: '2.5rem', 
              maxHeight: 'calc(100vh - 320px)', 
              overflowY: 'auto',
              background: '#fafbfc'
            }}>
              {/* Error Message */}
              {passwordError && (
                <div style={{
                  marginBottom: '2rem',
                  padding: '1.25rem 1.5rem',
                  background: '#FEE5E5',
                  border: '1px solid #FDBABA',
                  borderRadius: '12px',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  animation: 'slideDown 0.3s ease',
                }}>
                  <AlertCircle size={20} style={{ color: '#DC2626', marginTop: '0px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      color: '#991b1b', 
                      fontWeight: '700' 
                    }}>Validation Error</p>
                    <p style={{ 
                      margin: '0.375rem 0 0 0', 
                      fontSize: '0.85rem', 
                      color: '#b91c1c' 
                    }}>{passwordError}</p>
                  </div>
                </div>
              )}

              {/* Section 1: Personal Information */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, #0F3460 0%, #1B4FA5 100%)',
                    borderRadius: '2px'
                  }}></div>
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    color: '#0F3460', 
                    fontWeight: '800', 
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>Personal Information</h3>
                  <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      transition: 'all 0.25s',
                      background: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                      e.currentTarget.style.background = '#F8FBFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'white';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>Username <span style={{ color: '#DC2626' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="username (no spaces, lowercase)"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase() })}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      transition: 'all 0.25s',
                      background: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                      e.currentTarget.style.background = '#F8FBFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'white';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>Phone Number <span style={{ color: '#DC2626' }}>*</span></label>
                  <input
                    type="tel"
                    placeholder="+251911234567"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      transition: 'all 0.25s',
                      background: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                      e.currentTarget.style.background = '#F8FBFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'white';
                    }}
                  />
                </div>
              </div>

              {/* Section 2: Security */}
              <div style={{ marginBottom: '2.5rem', paddingTop: '2.5rem', borderTop: '2px solid #E5E7EB' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, #0F3460 0%, #1B4FA5 100%)',
                    borderRadius: '2px'
                  }}></div>
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    color: '#0F3460', 
                    fontWeight: '800', 
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>Security & Password</h3>
                  <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>1st Password <span style={{ color: '#DC2626' }}>*</span> <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '400' }}>(minimum 6 characters)</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword1 ? 'text' : 'password'}
                      placeholder="Enter first password"
                      value={newUser.password1}
                      onChange={(e) => setNewUser({ ...newUser, password1: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.95rem 1.25rem 0.95rem 3.75rem',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        fontWeight: '500',
                        transition: 'all 0.25s',
                        background: 'white',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1B4FA5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                        e.currentTarget.style.background = '#F8FBFF';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'white';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword1(!showPassword1)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9CA3AF',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1B4FA5'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>2nd Password <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '400' }}>(optional, different from 1st)</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword2 ? 'text' : 'password'}
                      placeholder="Enter second password (can be different)"
                      value={newUser.password2}
                      onChange={(e) => setNewUser({ ...newUser, password2: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.95rem 1.25rem 0.95rem 3.75rem',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        fontWeight: '500',
                        transition: 'all 0.25s',
                        background: 'white',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1B4FA5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                        e.currentTarget.style.background = '#F8FBFF';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'white';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword2(!showPassword2)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9CA3AF',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1B4FA5'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Role & Permissions */}
              <div style={{ marginBottom: '0', paddingTop: '2.5rem', borderTop: '2px solid #E5E7EB' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, #0F3460 0%, #1B4FA5 100%)',
                    borderRadius: '2px'
                  }}></div>
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    color: '#0F3460', 
                    fontWeight: '800', 
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>Access & Permissions</h3>
                  <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.75rem' 
                  }}>User Role <span style={{ color: '#DC2626' }}>*</span></label>
                  <select
                    value={newUser.role}
                    onChange={(e) => {
                      setNewUser({ ...newUser, role: e.target.value as 'admin' | 'sales', tasks: getAllFeatureIds() })
                    }}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.25s',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="sales">Sales Representative</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: '#6B7280', 
                    margin: '0.75rem 0 0 0',
                    fontWeight: '400'
                  }}>
                    {newUser.role === 'admin' ? 'Full system access with all administration features and controls' : 'Limited access focused on sales operations and customer management'}
                  </p>
                </div>

                {/* Task Selection */}
                <div>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '1.25rem' 
                  }}>Assign Permissions <span style={{ color: '#DC2626' }}>*</span></label>
                  <div style={{
                    background: 'white',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    transition: 'all 0.25s',
                  }}>
                    {getFeatureList().length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#9CA3AF', textAlign: 'center', fontWeight: '500' }}>No permissions available</p>
                    ) : (
                      getFeatureList().map((feature, index) => (
                        <div key={feature.id} style={{ 
                          marginBottom: index === getFeatureList().length - 1 ? 0 : '1.25rem',
                          paddingBottom: index === getFeatureList().length - 1 ? 0 : '1.25rem',
                          borderBottom: index === getFeatureList().length - 1 ? 'none' : '1px solid #F3F4F6',
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '1rem',
                        }}>
                          <input
                            type="checkbox"
                            id={feature.id}
                            checked={newUser.tasks.includes(feature.id)}
                            onChange={() => handleTaskToggle(feature.id)}
                            style={{
                              cursor: 'pointer',
                              marginTop: '2px',
                              width: '20px',
                              height: '20px',
                              accentColor: '#1B4FA5',
                              flexShrink: 0,
                            }}
                          />
                          <label htmlFor={feature.id} style={{ cursor: 'pointer', flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{feature.label}</div>
                            <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{feature.category}</div>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem 1.25rem',
                    background: '#F8FBFF',
                    border: '1px solid #E0F2FE',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#1B4FA5',
                    fontWeight: '600',
                  }}>
                    Selected: <strong style={{ fontSize: '0.95rem' }}>{newUser.tasks.length}</strong> of <strong style={{ fontSize: '0.95rem' }}>{getFeatureList().length}</strong> permissions
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Professional */}
            <div style={{
              padding: '2rem 2.5rem',
              background: 'white',
              borderTop: '1px solid #E5E7EB',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.02)',
            }}>
              <button
                onClick={handleAddUser}
                style={{
                  padding: '1.05rem 2rem',
                  background: 'linear-gradient(135deg, #0F3460 0%, #1B4FA5 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(27, 79, 165, 0.25)',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(27, 79, 165, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(27, 79, 165, 0.25)';
                }}
              >
                Create User
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewUser({ username: '', fullName: '', phone: '', role: 'sales', password1: '', password2: '', tasks: getAllFeatureIds() });
                  setPasswordError('');
                }}
                style={{
                  padding: '1.05rem 2rem',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E7EB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - Professional Enhanced Version */}
      {showEditModal && editingUserId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto',
        }} onClick={() => setShowEditModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            width: '100%',
            maxWidth: '600px',
            overflow: 'hidden',
            margin: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header - Premium Enterprise Style */}
            <div style={{
              background: 'linear-gradient(135deg, #0F3460 0%, #1B4FA5 50%, #16366d 100%)',
              padding: '2.5rem 2rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              borderBottom: 'none',
              boxShadow: '0 4px 6px rgba(15, 52, 96, 0.15)',
            }}>
              <div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.75rem', 
                  fontWeight: '900', 
                  letterSpacing: '-0.7px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>Edit User</h2>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '0.85rem', 
                  opacity: 0.9,
                  fontWeight: '400'
                }}>Update team member account details</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >✕</button>
            </div>

            {/* Modal Body - Professional Layout */}
            <div style={{ 
              padding: '2.5rem', 
              maxHeight: 'calc(100vh - 320px)', 
              overflowY: 'auto',
              background: '#fafbfc'
            }}>
              {/* Error Message */}
              {passwordError && (
                <div style={{
                  marginBottom: '2rem',
                  padding: '1.25rem 1.5rem',
                  background: '#FEE5E5',
                  border: '1px solid #FDBABA',
                  borderRadius: '12px',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  animation: 'slideDown 0.3s ease',
                }}>
                  <AlertCircle size={20} style={{ color: '#DC2626', marginTop: '0px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      color: '#991b1b', 
                      fontWeight: '700' 
                    }}>Validation Error</p>
                    <p style={{ 
                      margin: '0.375rem 0 0 0', 
                      fontSize: '0.85rem', 
                      color: '#b91c1c' 
                    }}>{passwordError}</p>
                  </div>
                </div>
              )}

              {/* Section 1: Personal Information */}
              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, #0F3460 0%, #1B4FA5 100%)',
                    borderRadius: '2px'
                  }}></div>
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    color: '#0F3460', 
                    fontWeight: '800', 
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>Personal Information</h3>
                  <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>Full Name <span style={{ color: '#DC2626' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      transition: 'all 0.25s',
                      background: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                      e.currentTarget.style.background = '#F8FBFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'white';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>Username <span style={{ color: '#DC2626' }}>*</span></label>
                  <input
                    type="text"
                    placeholder="username (no spaces, lowercase)"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase() })}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      transition: 'all 0.25s',
                      background: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                      e.currentTarget.style.background = '#F8FBFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'white';
                    }}
                  />
                </div>

                <div>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>Phone Number <span style={{ color: '#DC2626' }}>*</span></label>
                  <input
                    type="tel"
                    placeholder="+251911234567"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      fontWeight: '500',
                      transition: 'all 0.25s',
                      background: 'white',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                      e.currentTarget.style.background = '#F8FBFF';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'white';
                    }}
                  />
                </div>
              </div>

              {/* Section 2: Security */}
              <div style={{ marginBottom: '2.5rem', paddingTop: '2.5rem', borderTop: '2px solid #E5E7EB' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, #0F3460 0%, #1B4FA5 100%)',
                    borderRadius: '2px'
                  }}></div>
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    color: '#0F3460', 
                    fontWeight: '800', 
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>Security & Password</h3>
                  <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.65rem' 
                  }}>1st Password <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '400' }}>(leave blank to keep current)</span></label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword1 ? 'text' : 'password'}
                      placeholder="Leave blank to keep current password"
                      value={newUser.password1}
                      onChange={(e) => setNewUser({ ...newUser, password1: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.95rem 1.25rem 0.95rem 3.75rem',
                        border: '1.5px solid #E5E7EB',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        fontWeight: '500',
                        transition: 'all 0.25s',
                        background: 'white',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#1B4FA5';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                        e.currentTarget.style.background = '#F8FBFF';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.background = 'white';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword1(!showPassword1)}
                      style={{
                        position: 'absolute',
                        right: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9CA3AF',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#1B4FA5'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                    >
                      {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {newUser.password1 && (
                  <div>
                    <label style={{ 
                      fontSize: '0.85rem', 
                      color: '#1F2937', 
                      fontWeight: '700', 
                      display: 'block', 
                      marginBottom: '0.65rem' 
                    }}>2nd Password <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '400' }}>(optional, can be different)</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword2 ? 'text' : 'password'}
                        placeholder="Enter second password (can be different from 1st)"
                        value={newUser.password2}
                        onChange={(e) => setNewUser({ ...newUser, password2: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.95rem 1.25rem 0.95rem 3.75rem',
                          border: '1.5px solid #E5E7EB',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          boxSizing: 'border-box',
                          fontWeight: '500',
                          transition: 'all 0.25s',
                          background: 'white',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#1B4FA5';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                          e.currentTarget.style.background = '#F8FBFF';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#E5E7EB';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.background = 'white';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2(!showPassword2)}
                        style={{
                          position: 'absolute',
                          right: '14px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9CA3AF',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#1B4FA5'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                      >
                        {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Role & Permissions */}
              <div style={{ marginBottom: '0', paddingTop: '2.5rem', borderTop: '2px solid #E5E7EB' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{
                    width: '3px',
                    height: '24px',
                    background: 'linear-gradient(180deg, #0F3460 0%, #1B4FA5 100%)',
                    borderRadius: '2px'
                  }}></div>
                  <h3 style={{ 
                    fontSize: '0.95rem', 
                    color: '#0F3460', 
                    fontWeight: '800', 
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px'
                  }}>Access & Permissions</h3>
                  <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }}></div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '0.75rem' 
                  }}>User Role <span style={{ color: '#DC2626' }}>*</span></label>
                  <select
                    value={newUser.role}
                    onChange={(e) => {
                      setNewUser({ ...newUser, role: e.target.value as 'admin' | 'sales', tasks: getAllFeatureIds() })
                    }}
                    style={{
                      width: '100%',
                      padding: '0.95rem 1.25rem',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                      background: 'white',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.25s',
                      color: '#1F2937',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#1B4FA5';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27, 79, 165, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="sales">Sales Representative</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <p style={{ 
                    fontSize: '0.8rem', 
                    color: '#6B7280', 
                    margin: '0.75rem 0 0 0',
                    fontWeight: '400'
                  }}>
                    {newUser.role === 'admin' ? 'Full system access with all administration features and controls' : 'Limited access focused on sales operations and customer management'}
                  </p>
                </div>

                {/* Task Selection */}
                <div>
                  <label style={{ 
                    fontSize: '0.85rem', 
                    color: '#1F2937', 
                    fontWeight: '700', 
                    display: 'block', 
                    marginBottom: '1.25rem' 
                  }}>Assign Permissions <span style={{ color: '#DC2626' }}>*</span></label>
                  <div style={{
                    background: 'white',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    transition: 'all 0.25s',
                  }}>
                    {getFeatureList().length === 0 ? (
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#9CA3AF', textAlign: 'center', fontWeight: '500' }}>No permissions available</p>
                    ) : (
                      getFeatureList().map((feature, index) => (
                        <div key={feature.id} style={{ 
                          marginBottom: index === getFeatureList().length - 1 ? 0 : '1.25rem',
                          paddingBottom: index === getFeatureList().length - 1 ? 0 : '1.25rem',
                          borderBottom: index === getFeatureList().length - 1 ? 'none' : '1px solid #F3F4F6',
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '1rem',
                        }}>
                          <input
                            type="checkbox"
                            id={`edit-${feature.id}`}
                            checked={newUser.tasks.includes(feature.id)}
                            onChange={() => handleTaskToggle(feature.id)}
                            style={{
                              cursor: 'pointer',
                              marginTop: '2px',
                              width: '20px',
                              height: '20px',
                              accentColor: '#1B4FA5',
                              flexShrink: 0,
                            }}
                          />
                          <label htmlFor={`edit-${feature.id}`} style={{ cursor: 'pointer', flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#1F2937', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{feature.label}</div>
                            <div style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{feature.category}</div>
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem 1.25rem',
                    background: '#F8FBFF',
                    border: '1px solid #E0F2FE',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#1B4FA5',
                    fontWeight: '600',
                  }}>
                    Selected: <strong style={{ fontSize: '0.95rem' }}>{newUser.tasks.length}</strong> of <strong style={{ fontSize: '0.95rem' }}>{getFeatureList().length}</strong> permissions
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Professional */}
            <div style={{
              padding: '2rem 2.5rem',
              background: 'white',
              borderTop: '1px solid #E5E7EB',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.02)',
            }}>
              <button
                onClick={handleUpdateUser}
                style={{
                  padding: '1.05rem 2rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.25)';
                }}
              >
                Update User
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setNewUser({ username: '', fullName: '', phone: '', role: 'sales', password1: '', password2: '', tasks: getAllFeatureIds() });
                  setPasswordError('');
                  setEditingUserId(null);
                }}
                style={{
                  padding: '1.05rem 2rem',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '10px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                  letterSpacing: '0.3px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E7EB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }} onClick={() => setShowLogoutConfirm(false)}>
          <div style={{
            background: 'white',
            borderRadius: '14px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            padding: '1.75rem',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            border: '2px solid #e9d5ff',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1rem',
              fontSize: '1.75rem',
              border: '2px solid #e9d5ff',
            }}>
              🔒
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.5rem 0' }}>Confirm Logout</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
              Are you sure you want to logout? You'll need to login again.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.background = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.25)',
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.35)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.25)';
                }}
              >
                <LogOut size={16} strokeWidth={2.5} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </>
  )
}
