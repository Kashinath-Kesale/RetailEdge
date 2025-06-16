import axios from "axios";
import { toast } from "react-toastify";

// Create axios instance with base configuration
const baseURL = process.env.REACT_APP_API_URL;
console.log("Initializing axios with baseURL:", baseURL);

// Ensure baseURL doesn't end with a slash and includes /api
const cleanBaseURL = baseURL?.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
const finalBaseURL = cleanBaseURL?.includes('/api') ? cleanBaseURL : `${cleanBaseURL}/api`;
console.log("Final baseURL:", finalBaseURL);

const axiosInstance = axios.create({
  baseURL: finalBaseURL,
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

    // Log request details
    console.log("📡 Request to:", config.url);
    console.log("🌐 Full URL:", `${config.baseURL}${config.url}`);
    console.log("🔀 Method:", config.method);
    console.log("🧾 Headers:", config.headers);
    console.log("📦 Data:", config.data);

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
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.msg || error.response?.data?.message || "An error occurred";

    console.error("❌ Response error:", error);
    console.error("🔍 Error details:", {
      status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
      },
    });

    // Handle 401 Unauthorized and 403 Forbidden
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (!window.location.pathname.includes("/login")) {
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      }
    }

    // Handle 404 Not Found
    if (status === 404) {
      toast.error("Resource not found. Please try again later.");
    }

    // Show default error message
    toast.error(message);

    return Promise.reject(error);
  }
);

export default axiosInstance;
