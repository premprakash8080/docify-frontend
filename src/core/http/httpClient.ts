import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import apiConfig from './apiConfig';
import type { HttpErrorResponse } from './httpTypes';

/**
 * Global loader state management
 */
class LoaderManager {
  private activeRequests = 0;
  private listeners: Set<(isLoading: boolean) => void> = new Set();

  show() {
    this.activeRequests++;
    this.notifyListeners();
  }

  hide() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.notifyListeners();
  }

  subscribe(listener: (isLoading: boolean) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const isLoading = this.activeRequests > 0;
    this.listeners.forEach((listener) => listener(isLoading));
  }

  get isLoading() {
    return this.activeRequests > 0;
  }
}

export const loaderManager = new LoaderManager();

/**
 * Create Axios instance with interceptors
 */
const createHttpClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Attach auth token
      const token = localStorage.getItem('jwt_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Show loader if showLoader is true (default)
      const requestConfig = config as InternalAxiosRequestConfig & { showLoader?: boolean };
      const showLoader = requestConfig.showLoader !== false; // Default to true

      if (showLoader) {
        loaderManager.show();
      }

      return config;
    },
    (error: AxiosError) => {
      loaderManager.hide();
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  instance.interceptors.response.use(
    (response) => {
      // Hide loader on success
      loaderManager.hide();
      return response;
    },
    (error: AxiosError) => {
      // Hide loader on error
      loaderManager.hide();

      // Handle 401 Unauthorized - logout user
      if (error.response?.status === 401) {
        // Clear auth token
        localStorage.removeItem('jwt_access_token');
        localStorage.removeItem('refresh_token');

        // Redirect to login (avoid infinite redirects)
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth-1/sign-in';
        }
      }

      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        // Optionally redirect or show error message
        console.error('Access forbidden: Insufficient permissions');
      }

      // Transform error to consistent format
      const errorResponse: HttpErrorResponse = {
        success: false,
        msg:
          (error.response?.data as { msg?: string })?.msg ||
          error.message ||
          'An unexpected error occurred',
        status: error.response?.status,
        errors: (error.response?.data as { errors?: Record<string, string[]> })?.errors,
      };

      return Promise.reject(errorResponse);
    }
  );

  return instance;
};

export const httpClient = createHttpClient();

