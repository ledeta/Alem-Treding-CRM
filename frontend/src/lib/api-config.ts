/**
 * API Configuration
 * Centralized API URL configuration for the frontend
 * Uses NEXT_PUBLIC_API_URL environment variable if available
 */

export const getApiUrl = (): string => {
  // In browser environment, use environment variable
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
  }
  
  // In server environment (SSR), use environment variable
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
};

export const API_BASE_URL = getApiUrl();

/**
 * Helper function to build API endpoints
 * Automatically adds /api prefix to all endpoints
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Add /api prefix if not already present
  const apiEndpoint = cleanEndpoint.startsWith('/api/') ? cleanEndpoint : `/api${cleanEndpoint}`;
  return `${baseUrl}${apiEndpoint}`;
};
