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
        
        if (!token) {
          setLoading(false);
          return;
        }

        // Get user data from localStorage
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Skip verification in development mode
        if (!config.ENABLE_VERIFICATION) {
          setLoading(false);
          return;
        }

        // Check if user is verified
        if (!user.isVerified) {
          setLoading(false);
          toast.info("Please verify your email before proceeding");
          return;
        }

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