/**
 * Authentication API Endpoints - Relative paths only
 * Base URL is automatically prefixed by HttpService
 */
export const AUTH_ENDPOINTS = {
  register: '/users/register',
  login: '/users/login',
  logout: '/users/logout',
  refreshToken: '/users/refresh-token',
  forgotPassword: '/users/forgot-password',
  resetPassword: '/users/reset-password',
  getProfile: '/users/profile',
} as const;

