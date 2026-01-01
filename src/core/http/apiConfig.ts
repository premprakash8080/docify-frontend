/**
 * API Configuration - Environment-based URL resolver
 * 
 * Supports:
 * - Development: http://127.0.0.1:2018/api
 * - Production: VITE_API_BASE_URL from environment variables
 * 
 * Usage:
 * - Local development: Uses default localhost URL
 * - Production: Set VITE_API_BASE_URL in .env.production
 */

const getApiBaseUrl = (): string => {
  // Check for environment variable first (production/staging)
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  if (envUrl) {
    return envUrl;
  }

  // Development default
  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:2018/api';
  }

  // Fallback for production if env var not set
  return 'http://127.0.0.1:2018/api';
};

const getApiTimeout = (): number => {
  const timeout = import.meta.env.VITE_API_TIMEOUT;
  return timeout ? parseInt(timeout, 10) : 30000;
};

export const apiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: getApiTimeout(),
  environment: import.meta.env.MODE || 'development',
} as const;

export default apiConfig;

