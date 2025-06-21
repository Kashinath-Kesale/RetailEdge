import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { FiLoader } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import config from "../config/environment";

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isVerified } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("🔍 PrivateRoute - Token exists:", !!token);
        console.log("🔍 PrivateRoute - isAuthenticated:", isAuthenticated);
        console.log("🔍 PrivateRoute - isVerified:", isVerified);
        
        if (!token) {
          console.log("🔍 PrivateRoute - No token found, redirecting to login");
          setLoading(false);
          return;
        }

        // Get user data from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        console.log("🔍 PrivateRoute - User data:", user);

        // Skip verification in development mode
        if (!config.ENABLE_VERIFICATION) {
          console.log("🔍 PrivateRoute - Verification disabled, allowing access");
          setLoading(false);
          return;
        }

        // Check if user is verified
        if (!user.isVerified) {
          console.log("🔍 PrivateRoute - User not verified, redirecting to verify-email");
          setLoading(false);
          toast.info("Please verify your email before proceeding");
          return;
        }

        console.log("🔍 PrivateRoute - Auth check passed, allowing access");
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setLoading(false);
        toast.error("Session expired. Please login again.");
      }
    };

    checkAuth();
  }, [location, isAuthenticated, isVerified]);

  if (loading) {
    console.log("🔍 PrivateRoute - Loading state");
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
    console.log("🔍 PrivateRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isVerified) {
    console.log("🔍 PrivateRoute - Not verified, redirecting to verify-email");
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  console.log("🔍 PrivateRoute - Rendering children");
  return children;
};

export default PrivateRoute; 