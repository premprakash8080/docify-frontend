import FuseUtils from '@fuse/utils/FuseUtils';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import jwtServiceConfig from './jwtServiceConfig';

/* eslint-disable camelcase */

class JwtService extends FuseUtils.EventEmitter {
  init() {
    this.setInterceptors();
    this.handleAuthentication();
  }

  setInterceptors = () => {
    // Request interceptor - add auth token to requests
    axios.interceptors.request.use(
      (config) => {
        const access_token = this.getAccessToken();
        if (access_token) {
          config.headers.Authorization = `Bearer ${access_token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle token refresh on 401
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      async (err) => {
        const originalRequest = err.config;

        // If error is 401 and we haven't tried to refresh yet
        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refresh_token = this.getRefreshToken();
            if (refresh_token) {
              const newToken = await this.refreshAccessToken(refresh_token);
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.emit('onAutoLogout', 'Token refresh failed');
            this.setSession(null);
            this.setRefreshToken(null);
            return Promise.reject(refreshError);
          }
        }

        // If still 401 after refresh attempt, logout
        if (err.response?.status === 401 && err.config && !err.config.__isRetryRequest) {
          this.emit('onAutoLogout', 'Invalid access_token');
          this.setSession(null);
          this.setRefreshToken(null);
        }

        return Promise.reject(err);
      }
    );
  };

  handleAuthentication = () => {
    const access_token = this.getAccessToken();

    if (!access_token) {
      this.emit('onNoAccessToken');
      return;
    }

    if (this.isAuthTokenValid(access_token)) {
      this.setSession(access_token);
      this.emit('onAutoLogin', true);
    } else {
      // Token expired - API doesn't provide refresh tokens, so just logout
      this.setSession(null);
      this.setRefreshToken(null);
      this.emit('onAutoLogout', 'access_token expired');
    }
  };

  /**
   * Transform API user object to app user format
   * The app expects: { role: [], data: { displayName, email, photoURL, shortcuts } }
   */
  transformUser = (apiUser) => {
    return {
      role: ['user'], // Default role, can be updated based on API response
      data: {
        displayName: apiUser.display_name || apiUser.displayName || apiUser.email?.split('@')[0] || 'User',
        email: apiUser.email,
        photoURL: apiUser.avatar_url || apiUser.photoURL || 'assets/images/avatars/brian-hughes.jpg',
        shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts', 'apps.tasks'],
      },
    };
  };

  /**
   * Register a new user
   */
  createUser = (data) => {
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.signUp, {
          email: data.email,
          password: data.password,
          display_name: data.displayName,
        })
        .then((response) => {
          // Handle API response format
          const responseData = response.data;
          
          if (responseData.success && responseData.data) {
            const { user: apiUser, token } = responseData.data;
            const transformedUser = this.transformUser(apiUser);
            
            this.setSession(token);
            // Note: API response doesn't include refresh_token, so we skip it
            
            resolve(transformedUser);
            this.emit('onLogin', transformedUser);
          } else {
            reject(new Error(responseData.msg || responseData.message || 'Registration failed'));
          }
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.msg ||
            error.response?.data?.message ||
            error.message ||
            'Registration failed';
          reject(new Error(errorMessage));
        });
    });
  };

  /**
   * Sign in with email and password
   */
  signInWithEmailAndPassword = (email, password) => {
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.signIn, {
          email,
          password,
        })
        .then((response) => {
          // Handle API response format
          const responseData = response.data;
          
          if (responseData.success && responseData.data) {
            const { user: apiUser, token } = responseData.data;
            const transformedUser = this.transformUser(apiUser);
            
            this.setSession(token);
            // Note: API response doesn't include refresh_token, so we skip it
            
            resolve(transformedUser);
            this.emit('onLogin', transformedUser);
          } else {
            reject(new Error(responseData.msg || responseData.message || 'Login failed'));
          }
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.msg ||
            error.response?.data?.message ||
            error.message ||
            'Login failed';
          reject(new Error(errorMessage));
        });
    });
  };

  /**
   * Sign in with stored token (verify token is still valid)
   */
  signInWithToken = () => {
    return new Promise((resolve, reject) => {
      const access_token = this.getAccessToken();

      if (!access_token) {
        reject(new Error('No access token found'));
        return;
      }

      if (!this.isAuthTokenValid(access_token)) {
        // Token expired - API doesn't provide refresh tokens, so logout
        this.logout();
        reject(new Error('Token expired'));
        return;
      }

      // Token is valid, decode and return user info
      try {
        const decoded = jwtDecode(access_token);
        const user = {
          role: ['user'],
          data: {
            displayName: decoded.display_name || decoded.displayName || decoded.email?.split('@')[0] || 'User',
            email: decoded.email || '',
            photoURL: 'assets/images/avatars/brian-hughes.jpg',
            shortcuts: ['apps.calendar', 'apps.mailbox', 'apps.contacts', 'apps.tasks'],
          },
        };
        resolve(user);
      } catch (error) {
        this.logout();
        reject(new Error('Invalid token'));
      }
    });
  };

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
      axios
        .post(jwtServiceConfig.refreshToken, {
          refresh_token: refreshToken,
        })
        .then((response) => {
          const responseData = response.data;
          
          if (responseData.success && responseData.data) {
            const { token, refresh_token: newRefreshToken } = responseData.data;
            this.setSession(token);
            if (newRefreshToken) {
              this.setRefreshToken(newRefreshToken);
            }
            resolve(token);
          } else {
            reject(new Error(responseData.msg || 'Token refresh failed'));
          }
        })
        .catch((error) => {
          const errorMessage =
            error.response?.data?.msg ||
            error.response?.data?.message ||
            error.message ||
            'Token refresh failed';
          reject(new Error(errorMessage));
        });
    });
  };

  /**
   * Update user data
   */
  updateUserData = (user) => {
    return axios.put(jwtServiceConfig.updateUser, user);
  };

  /**
   * Set session tokens
   */
  setSession = (access_token) => {
    if (access_token) {
      localStorage.setItem('jwt_access_token', access_token);
      axios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
    } else {
      localStorage.removeItem('jwt_access_token');
      delete axios.defaults.headers.common.Authorization;
    }
  };

  /**
   * Set refresh token
   */
  setRefreshToken = (refresh_token) => {
    if (refresh_token) {
      localStorage.setItem('jwt_refresh_token', refresh_token);
    } else {
      localStorage.removeItem('jwt_refresh_token');
    }
  };

  /**
   * Get refresh token
   */
  getRefreshToken = () => {
    return window.localStorage.getItem('jwt_refresh_token');
  };

  /**
   * Logout user
   */
  logout = () => {
    const access_token = this.getAccessToken();
    
    // Call logout API if we have a token
    if (access_token) {
      axios
        .post(jwtServiceConfig.logout, {}, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
        .catch((error) => {
          // Even if logout API fails, clear local session
          console.error('Logout API call failed:', error);
        });
    }

    // Clear local session
    this.setSession(null);
    this.setRefreshToken(null);
    this.emit('onLogout', 'Logged out');
  };

  /**
   * Check if auth token is valid
   */
  isAuthTokenValid = (access_token) => {
    if (!access_token) {
      return false;
    }
    
    try {
      const decoded = jwtDecode(access_token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        console.warn('access token expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Invalid token format:', error);
      return false;
    }
  };

  /**
   * Get access token
   */
  getAccessToken = () => {
    return window.localStorage.getItem('jwt_access_token');
  };
}

const instance = new JwtService();

export default instance;
