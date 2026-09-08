import axios, { AxiosInstance, AxiosError } from 'axios'
import { useAuthStore } from '@/store/auth-store'

// Get API URL dynamically to support runtime changes
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use window location to construct API URL
    // If frontend is on 127.0.0.1, use 127.0.0.1 for API too
    const hostname = window.location.hostname
    return `http://${hostname}:3001/api`
  }
  // Server-side: use environment variable
  return (process.env.NEXT_PUBLIC_API_URL || 'https://alem-treding-backend.onrender.com') + '/api'
}

class ApiClient {
  private client: AxiosInstance

  constructor() {
    const API_BASE_URL = getApiBaseUrl()
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Try to get token from Zustand store first
        let token = useAuthStore.getState().token
        
        // Fallback to localStorage if Zustand store is not yet hydrated
        if (!token && typeof window !== 'undefined') {
          token = localStorage.getItem('token')
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('🔐 Token sent with request:', config.url?.substring(0, 50))
        } else {
          console.warn('⚠️ No token available for request:', config.url?.substring(0, 50))
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        // Only suppress logs for network errors (backend is down)
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || !error.response) {
          // Network error - return reject (not null to preserve error type)
          return Promise.reject({
            status: error.code,
            message: 'Network error - backend may be unavailable',
          })
        }

        // For any response status, return the actual error
        // Don't trigger logout on 401 - let components handle gracefully
        return Promise.reject({
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        })
      }
    )
  }

  async get<T>(url: string, config = {}): Promise<T> {
    return this.client.get(url, config)
  }

  async post<T>(url: string, data?: any, config = {}): Promise<T> {
    return this.client.post(url, data, config)
  }

  async put<T>(url: string, data?: any, config = {}): Promise<T> {
    return this.client.put(url, data, config)
  }

  async patch<T>(url: string, data?: any, config = {}): Promise<T> {
    return this.client.patch(url, data, config)
  }

  async delete<T>(url: string, config = {}): Promise<T> {
    return this.client.delete(url, config)
  }
}

export const apiClient = new ApiClient()
