/**
 * API Configuration
 * Centralized API URL configuration for the frontend
 */

export const getApiUrl = (): string => {
  // Always prefer the environment variable (set in Render dashboard)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // In browser: auto-detect based on hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname

    // Production on Render - hardcoded backend URL
    if (hostname.endsWith('.onrender.com')) {
      return 'https://alem-crm-backend.onrender.com'
    }
  }

  // Local development
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
