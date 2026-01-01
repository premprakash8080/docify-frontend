/**
 * Authentication Types - Based on API Reference
 */

export interface User {
  id: number;
  email: string;
  display_name?: string;
  avatar_url?: string;
  auth_provider?: string;
}

export interface AuthResponse {
  success: boolean;
  msg: string;
  data: {
    user: User;
    token: string;
    expires: string;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  display_name?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  msg: string;
  data: {
    token: string;
    expires: string;
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface LogoutResponse {
  success: boolean;
  msg: string;
}

