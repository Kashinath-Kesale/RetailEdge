import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api/auth`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Attach token to request if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    if (response.config.url.includes("/verify-email")) return response;
    return response;
  },
  (error) => {
    if (error.config?.url?.includes("/verify-email")) {
      return Promise.reject(error);
    }

    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired. Please log in again.");
        window.location.href = "/";
      } else if (error.response.status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else {
        toast.error(error.response.data?.msg || "An error occurred");
      }
    } else {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
