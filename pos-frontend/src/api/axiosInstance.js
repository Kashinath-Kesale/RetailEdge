import axios from "axios";
import { toast } from "react-toastify";
import config from "../config/environment";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  timeout: config.REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json, text/plain, */*"
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept all status codes less than 500
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (requestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Add token to headers if it exists
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    // Only log in development mode
    if (config.ENABLE_LOGGING) {
      console.log("📡 Request:", requestConfig.method?.toUpperCase(), requestConfig.url);
    }

    return requestConfig;
  },
  (error) => {
    if (config.ENABLE_LOGGING) {
      console.error("❌ Request error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Only log in development mode
    if (config.ENABLE_LOGGING) {
      console.log("✅ Response:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (config.ENABLE_LOGGING) {
      console.error("❌ Response error:", {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message
      });
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }

    // Handle network errors
    if (!error.response) {
      if (config.ENABLE_LOGGING) {
        console.error("Network error:", error.message);
      }
      return Promise.reject(new Error("Network error. Please check your internet connection."));
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      if (config.ENABLE_LOGGING) {
        console.error("Server error:", error.response.data);
      }
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    // Handle validation errors
    if (error.response?.status === 400) {
      const message = error.response.data?.message || "Invalid request";
      return Promise.reject(new Error(message));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
