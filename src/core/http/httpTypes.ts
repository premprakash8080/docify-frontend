import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP Request configuration extending Axios config
 */
export interface HttpRequestConfig extends AxiosRequestConfig {
  /**
   * Whether to show global loader during request (default: true)
   */
  showLoader?: boolean;
}

/**
 * HTTP Response wrapper
 */
export interface HttpResponse<T = unknown> extends AxiosResponse<T> {
  data: T;
}

/**
 * Standard API Response format
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  msg?: string;
  data: T;
}

/**
 * HTTP Error Response
 */
export interface HttpErrorResponse {
  success: false;
  msg: string;
  errors?: Record<string, string[]>;
  status?: number;
}

