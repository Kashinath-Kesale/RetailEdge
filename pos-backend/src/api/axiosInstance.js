import axios from 'axios';

// Get the API URL from environment variables
const apiUrl = process.env.REACT_APP_API_URL || 'https://retailedge-backend.onrender.com';

// Ensure the API URL doesn't end with a slash
const baseURL = `${apiUrl.replace(/\/$/, '')}/api`;

// Log configuration for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', apiUrl);
console.log('Base URL:', baseURL);
console.log('Full API URL:', `${baseURL}/auth/signup`);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false,
  timeout: 15000,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure URL doesn't have double slashes
    if (config.url) {
      config.url = config.url.replace(/\/+/g, '/');
    }
    
    // Log detailed request information
    console.log('Request Details:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('Response Details:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config?.url,
      baseURL: response.config?.baseURL,
      fullURL: `${response.config?.baseURL}${response.config?.url}`,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Log detailed error information
      console.error('API Error Details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        data: error.response.data,
        headers: error.response.headers,
        method: error.config?.method?.toUpperCase()
      });

      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Access forbidden');
          break;
        case 404:
          console.error('Resource not found - Check if the endpoint exists:', error.config?.url);
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    } else if (error.request) {
      console.error('Network error - no response received:', {
        request: error.request,
        config: error.config
      });
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 