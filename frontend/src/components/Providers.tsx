'use client'

import { ReactNode, useMemo, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth-store'
import PortRedirect from './PortRedirect'

// Component to restore auth state from localStorage on app load
function AuthInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Manually hydrate auth store from localStorage
    useAuthStore.getState().hydrate()
  }, [])

  // Always render children - auth restoration happens in parallel
  return children
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
          },
        },
      }),
    []
  )

  // Suppress network error logs when backend is unavailable (expected behavior)
  useEffect(() => {
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    // Function to check if message contains network error
    const isNetworkError = (args: any[]): boolean => {
      const str = args.join(' ').toString().toLowerCase()
      return (
        str.includes('err_connection_refused') ||
        str.includes('net::err_connection_refused') ||
        str.includes('failed to load resource') ||
        str.includes('3001/api') ||
        str.includes('localhost:3001') ||
        str.includes('connection refused') ||
        (str.includes('get') && str.includes('http://localhost:3001'))
      )
    }

    console.error = (...args: any[]) => {
      if (!isNetworkError(args)) {
        originalError.apply(console, args)
      }
    }

    console.warn = (...args: any[]) => {
      if (!isNetworkError(args)) {
        originalWarn.apply(console, args)
      }
    }

    // Suppress log messages containing network errors too
    console.log = (...args: any[]) => {
      if (!isNetworkError(args)) {
        originalLog.apply(console, args)
      }
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
      console.log = originalLog
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <PortRedirect />
        {children}
      </AuthInitializer>
    </QueryClientProvider>
  )
}
