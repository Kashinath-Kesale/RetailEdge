import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from '../api/axiosInstance';

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Checking authentication...", { token: !!token });

        if (!token) {
          console.log("No token found, redirecting to login");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Set default headers for all requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Get user data from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("User data from localStorage:", { 
          hasUser: !!user,
          isVerified: user.isVerified,
          role: user.role
        });

        // In development mode, skip verification
        if (process.env.NODE_ENV === 'development') {
          console.log("Development mode: Skipping verification");
          setIsAuthenticated(true);
          setIsVerified(true);
          setLoading(false);
          return;
        }

        // Check if user is verified
        if (!user.isVerified) {
          console.log("User not verified, redirecting to verify-email");
          setIsAuthenticated(true);
          setIsVerified(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setIsVerified(true);
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        setLoading(false);
        toast.error("Session expired. Please login again.");
      }
    };

    checkAuth();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 