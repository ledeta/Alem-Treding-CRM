import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  fullName: string
  email: string
  role: 'admin' | 'sales'
  status: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  hydrate: () => void // Manual hydration method
}

export const useAuthStore = create<AuthStore>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      setToken: (token: string) => set({ token, isAuthenticated: !!token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      hydrate: () => {
        // Manual hydration to sync from localStorage
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('token')
          const storedUser = localStorage.getItem('user')
          
          if (storedToken) {
            set({ token: storedToken, isAuthenticated: true })
          }
          
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser)
              set({ user, isAuthenticated: true })
            } catch (e) {
              console.warn('Failed to parse stored user', e)
            }
          }
        }
      },
    }),
    {
      name: 'auth-store',
      // Ensure all critical auth state persists and survives page reload
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
