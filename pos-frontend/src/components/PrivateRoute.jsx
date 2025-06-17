import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      console.log("PrivateRoute check:", {
        hasToken: !!token,
        user: user,
        path: location.pathname
      });

      if (!token) {
        console.log("No token found, redirecting to login");
        setRedirectPath("/login");
        setShouldRedirect(true);
        return;
      }

      // Development mode: Skip verification check
      if (process.env.NODE_ENV === 'development') {
        console.log("Development mode: Skipping verification check");
        setIsLoading(false);
        return;
      }

      // Production mode: Check verification
      if (!user.isVerified) {
        console.log("User not verified, redirecting to verify-email");
        setRedirectPath("/verify-email");
        setShouldRedirect(true);
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (shouldRedirect) {
    if (redirectPath === "/login") {
      toast.error("Please login to access this page");
    } else if (redirectPath === "/verify-email") {
      toast.info("Please verify your email before proceeding");
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 