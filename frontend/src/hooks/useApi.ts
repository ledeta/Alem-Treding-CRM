import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import toast from 'react-hot-toast'

export function useApiQuery<TData>(
  key: any[],
  url: string,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData>({
    queryKey: key,
    queryFn: async () => {
      // Check if token exists before making request
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token available')
      }
      return apiClient.get(url)
    },
    retry: (failureCount, error: any) => {
      // Retry on 401 or network errors, but not after max retries
      const isAuthError = error?.response?.status === 401
      const isNetworkError = error?.code === 'ERR_NETWORK' || !error?.response
      
      if ((isAuthError || isNetworkError) && failureCount < 3) {
        return true
      }
      return false
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 8000)
    },
    ...options,
  })
}

export function useApiMutation<TData, TVariables = any>(
  mutationFn: (data: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useMutation<TData, Error, TVariables>(
    {
      mutationFn,
      onError: (error: any) => {
        const message = error?.message || 'An error occurred'
        toast.error(message)
      },
      ...options,
    }
  )
}

export function useApiGet<TData>(url: string, options?: any) {
  return useApiQuery<TData>([url], url, options)
}

export function useApiPost<TData, TVariables = any>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useApiMutation<TData, TVariables>(
    (data) => apiClient.post(url, data),
    options
  )
}

export function useApiPut<TData, TVariables = any>(
  url: string,
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  return useApiMutation<TData, TVariables>(
    (data) => apiClient.put(url, data),
    options
  )
}

export function useApiDelete<TData = any>(
  url: string,
  options?: UseMutationOptions<TData, Error>
) {
  return useApiMutation<TData>(
    () => apiClient.delete(url),
    options
  )
}
