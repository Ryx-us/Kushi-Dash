import axios from 'axios';

// Get API config from window global
const apiConfig = window.auth?.api || {
  baseUrl: '/api',
  csrfToken: '',
};

/**
 * Helper to get cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} Cookie value or null if not found
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

/**
 * Helper to check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
function isAuthenticated() {
  return !!window.KushiData?.auth?.user;
}

/**
 * Create a bearer token header if a token is available
 * @returns {Object|null} Authorization header object or null
 */
function getAuthHeader() {
  // If you have a bearer token stored, add it here
  const token = localStorage.getItem('api_token');
  return token ? { 'Authorization': `Bearer ${token}` } : null;
}

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: apiConfig.baseUrl,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // This is crucial for sending cookies with requests
});

// Add request interceptor for dynamic CSRF token and authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Add CSRF token from the meta tag
    if (window.auth?.api?.csrfToken) {
      config.headers['X-CSRF-TOKEN'] = window.auth.api.csrfToken;
    }
    
    // Add CSRF token from cookie (Laravel's XSRF-TOKEN)
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }

    // Add Authorization header if we have a bearer token
    const authHeader = getAuthHeader();
    if (authHeader) {
      Object.assign(config.headers, authHeader);
    }

    // Add common debug headers for all environments
    config.headers['X-KushiDash-Client'] = 'web';
    config.headers['X-KushiDash-Version'] = '1.0.0';

    // Debug info for development only
    if (process.env.NODE_ENV !== 'production') {
      console.log('Request Headers:', config.headers);
      console.log('Request URL:', config.baseURL + config.url);
      console.log('Authenticated:', isAuthenticated());
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Debug info for development only
    if (process.env.NODE_ENV !== 'production') {
      console.log('Response Error:', error.response || error);
    }

    // Handle specific error cases
    if (error.response) {
      switch (error.response.status) {
        case 419:
          console.error('CSRF token mismatch. Try refreshing the page.');
          // Consider refreshing the token automatically here
          break;
          
        case 401:
          console.error('Authentication required.');
          
          // Extract error details from the response
          const errorCode = error.response.data?.code;
          const errorMessage = error.response.data?.message || 'Authentication required';
          
          // Log detailed error information
          console.error(`API Auth Error: ${errorCode} - ${errorMessage}`);
          
          // Only redirect to login for session-based auth failures
          // For token-based failures, just show an error
          if (errorCode === 'unauthenticated' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          }
          break;
          
        case 403:
          console.error('Permission denied: ', error.response.data?.message || 'You don\'t have permission to perform this action.');
          break;
          
        case 422:
          console.error('Validation failed:', error.response.data?.errors || error.response.data);
          break;
          
        case 429:
          console.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          console.error('Server error. Please try again later or contact support.');
          break;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper to process the response data
 * @param {Object} response - Axios response object
 * @returns {*} Extracted response data
 */
const processResponse = (response) => {
  return response.data;
};

/**
 * Main HTTP client with common request methods
 */
const http = {
  /**
   * Check if the user is authenticated
   * @returns {boolean} True if the user is authenticated
   */
  isAuthenticated,
  
  /**
   * Set an API token for Bearer authentication
   * @param {string} token - The API token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem('api_token', token);
    } else {
      localStorage.removeItem('api_token');
    }
  },
  
  /**
   * Get the current API token
   * @returns {string|null} The API token or null
   */
  getToken() {
    return localStorage.getItem('api_token');
  },
  
  /**
   * Remove the stored API token
   */
  clearToken() {
    localStorage.removeItem('api_token');
  },
  
  /**
   * Perform a GET request
   * @param {string} url - The URL to request
   * @param {Object} config - Optional axios config
   * @returns {Promise<*>} Response data
   */
  async get(url, config = {}) {
    try {
      const response = await axiosInstance.get(url, config);
      return processResponse(response);
    } catch (error) {
      // Special case: if we get a 401 on a protected route, try using the public version
      if (error.response?.status === 401 && !url.startsWith('public/')) {
        try {
          console.log('Retrying with public endpoint...');
          const publicResponse = await axiosInstance.get(`public/${url}`);
          return processResponse(publicResponse);
        } catch (publicError) {
          // If the public endpoint also fails, throw the original error
          throw error;
        }
      }
      throw error;
    }
  },

  /**
   * Perform a POST request
   * @param {string} url - The URL to request
   * @param {*} data - The data to send
   * @param {Object} config - Optional axios config
   * @returns {Promise<*>} Response data
   */
  async post(url, data = {}, config = {}) {
    const response = await axiosInstance.post(url, data, config);
    return processResponse(response);
  },

  /**
   * Perform a PUT request
   * @param {string} url - The URL to request
   * @param {*} data - The data to send
   * @param {Object} config - Optional axios config
   * @returns {Promise<*>} Response data
   */
  async put(url, data = {}, config = {}) {
    const response = await axiosInstance.put(url, data, config);
    return processResponse(response);
  },

  /**
   * Perform a PATCH request
   * @param {string} url - The URL to request
   * @param {*} data - The data to send
   * @param {Object} config - Optional axios config
   * @returns {Promise<*>} Response data
   */
  async patch(url, data = {}, config = {}) {
    const response = await axiosInstance.patch(url, data, config);
    return processResponse(response);
  },

  /**
   * Perform a DELETE request
   * @param {string} url - The URL to request
   * @param {Object} config - Optional axios config
   * @returns {Promise<*>} Response data
   */
  async delete(url, config = {}) {
    const response = await axiosInstance.delete(url, config);
    return processResponse(response);
  },

  /**
   * Perform a custom request
   * @param {Object} config - Axios request config
   * @returns {Promise<*>} Response data
   */
  async request(config) {
    const response = await axiosInstance.request(config);
    return processResponse(response);
  },

  /**
   * Upload a file or form data
   * @param {string} url - The URL to upload to
   * @param {File|FormData} fileOrFormData - File or FormData to upload
   * @param {Function} onProgress - Optional callback for upload progress
   * @returns {Promise<*>} Response data
   */
  async upload(url, fileOrFormData, onProgress) {
    // Create form data if a File was provided
    let formData;
    
    if (fileOrFormData instanceof File) {
      formData = new FormData();
      formData.append('file', fileOrFormData);
    } else {
      formData = fileOrFormData;
    }

    const response = await axiosInstance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100)
        );
        onProgress(percentCompleted);
      } : undefined,
    });

    return processResponse(response);
  },
};

// Export additional utilities for advanced usage
export const apiService = {
  http,
  instance: axiosInstance,
  
  /**
   * Helper to create a cancellable request
   * @returns {Object} Object with signal and cancel method
   */
  createCancellableRequest: () => {
    const controller = new AbortController();
    return {
      signal: controller.signal,
      cancel: (message = 'Request cancelled') => controller.abort(message),
    };
  },
  
  /**
   * Helper to perform concurrent requests
   * @param {Array<Promise>} promises - Array of promises to resolve
   * @returns {Promise<Array>} Resolved promise results
   */
  async all(promises) {
    return Promise.all(promises);
  }
};

// Export default http client for easy imports
export default http;