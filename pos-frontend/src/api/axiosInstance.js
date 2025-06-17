import axios from "axios";
import { toast } from "react-toastify";

// Create axios instance with base configuration
const baseURL = process.env.REACT_APP_API_URL || 'https://retailedge-backend.onrender.com';
console.log("Initializing axios with baseURL:", baseURL);

const axiosInstance = axios.create({
  baseURL: `${baseURL}/api`,
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
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log("📡 Request to:", config.url);
    console.log("🌐 Full URL:", `${config.baseURL}${config.url}`);
    console.log("🔀 Method:", config.method.toUpperCase());
    console.log("🧾 Headers:", config.headers);
    if (config.data) {
      console.log("📦 Data:", config.data);
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log("✅ Response:", {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error("❌ Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

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
      console.error("Network error:", error.message);
      return Promise.reject(new Error("Network error. Please check your internet connection."));
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response.data);
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
