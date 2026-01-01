import httpService from '@/core/http';
import { AUTH_ENDPOINTS } from './auth.endpoints';
import type {
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  RefreshTokenPayload,
  RefreshTokenResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  LogoutResponse,
} from './auth.types';

/**
 * Authentication Service - Using centralized HttpService
 * 
 * Handles all authentication-related API calls:
 * - Register, Login, Logout
 * - Password reset flow
 * - Token refresh
 */
class AuthService {
  /**
   * Register a new user
   * @param payload - Registration data (email, password, display_name)
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Auth response with user and token
   */
  async register(
    payload: RegisterPayload,
    showLoader = true
  ): Promise<AuthResponse> {
    const response = await httpService.post<{
      user: AuthResponse['data']['user'];
      token: string;
      expires: string;
    }>(AUTH_ENDPOINTS.register, payload, { showLoader });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data as AuthResponse;
    }
    return {
      success: true,
      msg: 'User registered successfully',
      data: response.data as AuthResponse['data'],
    };
  }

  /**
   * Login user
   * @param payload - Login credentials (email, password)
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Auth response with user and token
   */
  async login(payload: LoginPayload, showLoader = true): Promise<AuthResponse> {
    const response = await httpService.post<{
      user: AuthResponse['data']['user'];
      token: string;
      expires: string;
    }>(AUTH_ENDPOINTS.login, payload, { showLoader });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const authResponse = response.data as AuthResponse;
      // Store token in localStorage
      if (authResponse.data?.token) {
        localStorage.setItem('jwt_access_token', authResponse.data.token);
        if (authResponse.data.expires) {
          localStorage.setItem('token_expires', authResponse.data.expires);
        }
      }
      return authResponse;
    }
    const authData = response.data as AuthResponse['data'];
    if (authData?.token) {
      localStorage.setItem('jwt_access_token', authData.token);
      if (authData.expires) {
        localStorage.setItem('token_expires', authData.expires);
      }
    }
    return {
      success: true,
      msg: 'Login successful',
      data: authData,
    };
  }

  /**
   * Logout user
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Logout response
   */
  async logout(showLoader = true): Promise<LogoutResponse> {
    const response = await httpService.post<unknown>(AUTH_ENDPOINTS.logout, null, { showLoader });

    // Clear tokens from localStorage
    localStorage.removeItem('jwt_access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires');

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as LogoutResponse;
    }
    return {
      success: true,
      msg: 'Logout successful',
    };
  }

  /**
   * Refresh authentication token
   * @param payload - Refresh token data
   * @param showLoader - Whether to show global loader (default: false)
   * @returns New token and expiration
   */
  async refreshToken(
    payload: RefreshTokenPayload,
    showLoader = false
  ): Promise<RefreshTokenResponse> {
    const response = await httpService.post<{
      token: string;
      expires: string;
    }>(AUTH_ENDPOINTS.refreshToken, payload, { showLoader });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const refreshResponse = response.data as RefreshTokenResponse;
      // Update token in localStorage
      if (refreshResponse.data?.token) {
        localStorage.setItem('jwt_access_token', refreshResponse.data.token);
        if (refreshResponse.data.expires) {
          localStorage.setItem('token_expires', refreshResponse.data.expires);
        }
      }
      return refreshResponse;
    }
    const tokenData = response.data as RefreshTokenResponse['data'];
    if (tokenData?.token) {
      localStorage.setItem('jwt_access_token', tokenData.token);
      if (tokenData.expires) {
        localStorage.setItem('token_expires', tokenData.expires);
      }
    }
    return {
      success: true,
      msg: 'Token refreshed successfully',
      data: tokenData,
    };
  }

  /**
   * Request password reset email
   * @param payload - Email address
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async forgotPassword(
    payload: ForgotPasswordPayload,
    showLoader = true
  ): Promise<{ success: boolean; msg: string }> {
    const response = await httpService.post<unknown>(AUTH_ENDPOINTS.forgotPassword, payload, {
      showLoader,
    });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg: string };
    }
    return {
      success: true,
      msg: 'Password reset email sent successfully',
    };
  }

  /**
   * Reset password with token
   * @param payload - Reset token and new password
   * @param showLoader - Whether to show global loader (default: true)
   * @returns Success response
   */
  async resetPassword(
    payload: ResetPasswordPayload,
    showLoader = true
  ): Promise<{ success: boolean; msg: string }> {
    const response = await httpService.post<unknown>(AUTH_ENDPOINTS.resetPassword, payload, {
      showLoader,
    });

    // Handle response format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response.data as { success: boolean; msg: string };
    }
    return {
      success: true,
      msg: 'Password reset successfully',
    };
  }
}

export default new AuthService();

