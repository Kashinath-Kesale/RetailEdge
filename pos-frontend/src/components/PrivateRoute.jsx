import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiLoader } from "react-icons/fi";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Checking authentication...", { 
          hasToken: !!token,
          path: location.pathname 
        });

        if (!token) {
          console.log("No token found, redirecting to login");
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // Set default headers for all requests
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Get user data from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("User data from localStorage:", {
          hasUser: !!user,
          isVerified: user.isVerified,
          role: user.role,
        });

        // In development mode, skip verification
        if (process.env.NODE_ENV === "development") {
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
          toast.info("Please verify your email before proceeding");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <FiLoader className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
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