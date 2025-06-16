import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  console.log("PrivateRoute check:", {
    hasToken: !!token,
    user: user,
    path: location.pathname
  });

  if (!token) {
    console.log("No token found, redirecting to login");
    toast.error("Please login to access this page");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is verified
  if (!user.isVerified) {
    console.log("User not verified, redirecting to verify-email");
    toast.info("Please verify your email before proceeding");
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 