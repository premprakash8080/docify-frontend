import { httpClient } from './httpClient';
import type { HttpRequestConfig, HttpResponse, ApiResponse } from './httpTypes';

/**
 * Centralized HTTP Service (Angular HttpClient-like)
 * 
 * Usage:
 * ```ts
 * const response = await httpService.get<User>('/users/1');
 * const users = await httpService.post<User[]>('/users', { name: 'John' });
 * ```
 */
class HttpService {
  /**
   * GET request
   * @param url - API endpoint (relative to baseURL)
   * @param config - Optional request configuration
   * @returns Promise with typed response data
   * 
   * @example
   * ```ts
   * const users = await httpService.get<User[]>('/users');
   * const user = await httpService.get<User>('/users/1', { showLoader: false });
   * ```
   */
  async get<T = unknown>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<ApiResponse<T> | T>> {
    return httpClient.get<ApiResponse<T> | T>(url, config);
  }

  /**
   * POST request
   * @param url - API endpoint (relative to baseURL)
   * @param data - Request body
   * @param config - Optional request configuration
   * @returns Promise with typed response data
   * 
   * @example
   * ```ts
   * const newUser = await httpService.post<User>('/users', { name: 'John', email: 'john@example.com' });
   * ```
   */
  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<ApiResponse<T> | T>> {
    return httpClient.post<ApiResponse<T> | T>(url, data, config);
  }

  /**
   * PUT request
   * @param url - API endpoint (relative to baseURL)
   * @param data - Request body
   * @param config - Optional request configuration
   * @returns Promise with typed response data
   * 
   * @example
   * ```ts
   * const updated = await httpService.put<User>('/users/1', { name: 'Jane' });
   * ```
   */
  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<ApiResponse<T> | T>> {
    return httpClient.put<ApiResponse<T> | T>(url, data, config);
  }

  /**
   * DELETE request
   * @param url - API endpoint (relative to baseURL)
   * @param config - Optional request configuration
   * @returns Promise with typed response data
   * 
   * @example
   * ```ts
   * await httpService.delete('/users/1');
   * ```
   */
  async delete<T = unknown>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<ApiResponse<T> | T>> {
    return httpClient.delete<ApiResponse<T> | T>(url, config);
  }

  /**
   * PATCH request
   * @param url - API endpoint (relative to baseURL)
   * @param data - Request body
   * @param config - Optional request configuration
   * @returns Promise with typed response data
   */
  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: HttpRequestConfig
  ): Promise<HttpResponse<ApiResponse<T> | T>> {
    return httpClient.patch<ApiResponse<T> | T>(url, data, config);
  }
}

export const httpService = new HttpService();
export default httpService;

