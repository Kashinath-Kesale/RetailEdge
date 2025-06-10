import axios from 'axios';

// Get the API URL from environment variables
const apiUrl = process.env.REACT_APP_API_URL || 'https://retailedge-backend.onrender.com';
const baseURL = `${apiUrl}/api`;

// Log configuration for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', apiUrl);
console.log('Base URL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false, // Changed to false for email verification
  timeout: 15000,
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request details
    console.log('Making request to:', `${config.baseURL}${config.url}`);
    
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
    console.log('Response received:', {
      status: response.status,
      url: response.config?.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (error.response) {
      // Log detailed error information
      console.error('API Error:', {
        status: error.response.status,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL}${error.config?.url}`,
        data: error.response.data,
        headers: error.response.headers
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
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    } else if (error.request) {
      console.error('Network error - no response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 