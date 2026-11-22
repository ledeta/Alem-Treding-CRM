/**
 * API Configuration
 */

export const getApiUrl = (): string => {
  // Runtime browser detection - works even when NEXT_PUBLIC_API_URL is empty at build time
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    // On Render production - always point to backend service
    if (hostname.endsWith('.onrender.com') && !hostname.includes('backend')) {
      return 'https://alem-crm-backend.onrender.com'
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3002'
    }
  }

  // Build-time env var (only works if set before next build)
  const envUrl = process.env.NEXT_PUBLIC_API_URL
  if (envUrl && envUrl.trim() !== '' && !envUrl.includes('frontend')) {
    return envUrl
  }

  return 'http://localhost:3002'
}

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
