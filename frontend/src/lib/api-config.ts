/**
 * API Configuration
 * Centralized API URL configuration for the frontend
 * Uses NEXT_PUBLIC_API_URL environment variable if available
 */

// Known backend URLs - fallback when env var not set
const KNOWN_BACKEND_URLS: Record<string, string> = {
  'alem-treding-crm.onrender.com': 'https://alem-crm-backend.onrender.com',
  'alem-crm-frontend.onrender.com': 'https://alem-crm-backend.onrender.com',
}

export const getApiUrl = (): string => {
  // Always prefer the environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // In browser: detect current hostname and map to backend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (KNOWN_BACKEND_URLS[hostname]) {
      return KNOWN_BACKEND_URLS[hostname]
    }
  }

  // Local development fallback
  return 'http://localhost:3002'
}

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
