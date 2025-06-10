// src/api/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://retailedge-backend.onrender.com/api",
});

// Add token to Authorization header if present in localStorage
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Token stored as string
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global response interceptor to handle 401 errors (unauthorized)
axiosInstance.interceptors.response.use(
  (response) => {
    // Don't show success toasts for verification endpoint
    if (response.config.url.includes('/verify-email')) {
      return response;
    }
    return response;
  },
  (error) => {
    // Don't show error toasts for verification endpoint
    if (error.config.url.includes('/verify-email')) {
      return Promise.reject(error);
    }

    if (error.response) {
      if (error.response.status === 401) {
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Show error message
        toast.error("Session expired. Please log in again.");
        
        // Redirect to login page
        window.location.href = "/";
      } else if (error.response.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else {
        // Show the error message from the server if available
        const errorMessage = error.response.data?.msg || "An error occurred";
        toast.error(errorMessage);
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
