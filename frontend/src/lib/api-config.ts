/**
 * API Configuration
 * Centralized API URL configuration for the frontend
 * Uses NEXT_PUBLIC_API_URL environment variable if available
 */

export const getApiUrl = (): string => {
  // In browser environment, use environment variable
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }
  
  // In server environment (SSR), use environment variable
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

export const API_BASE_URL = getApiUrl();

/**
 * Helper function to build API endpoints
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
