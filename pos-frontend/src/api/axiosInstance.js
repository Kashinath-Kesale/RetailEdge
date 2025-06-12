import axios from "axios";
import { toast } from "react-toastify";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: "https://retailedge-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request details
    console.log("Full request URL:", config.baseURL + config.url);
    console.log("Method:", config.method);
    console.log("Headers:", config.headers);
    console.log("Data:", config.data);

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    
    // Handle 401 Unauthorized and 403 Forbidden errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear any existing tokens
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Only redirect if not on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
        toast.error("Session expired. Please login again.");
      }
    }

    // Handle 404 errors
    if (error.response?.status === 404) {
      console.error("Resource not found:", error.config.url);
      toast.error("Resource not found. Please try again later.");
    }

    // Handle other errors
    const errorMessage = error.response?.data?.msg || "An error occurred";
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default axiosInstance;