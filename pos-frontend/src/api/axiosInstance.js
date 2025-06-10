// src/api/axiosInstance.js
import axios from "axios";
import { toast } from "react-toastify";

// Create axios instance with backend base URL from .env
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
  withCredentials: false, // Set true only if using cookies/auth sessions
});

// Request Interceptor: Add Authorization token if present
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle global error responses
axiosInstance.interceptors.response.use(
  (response) => {
    // Skip toast for email verification route
    if (response.config.url.includes('/verify-email')) {
      return response;
    }
    return response;
  },
  (error) => {
    if (error?.config?.url?.includes('/verify-email')) {
      return Promise.reject(error);
    }

    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/";
      } else if (status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else {
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
