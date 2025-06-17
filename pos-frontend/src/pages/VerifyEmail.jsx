import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiCheckCircle } from "react-icons/fi";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!user.email) {
        toast.error("Please login again to request a new verification email");
        navigate("/login");
        return;
      }

      const response = await axiosInstance.post("/auth/resend-verification", {
        email: user.email
      });

      if (response.data.success) {
        toast.success("Verification email sent! Please check your inbox.");
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      toast.error(err.response?.data?.msg || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        setLoading(true);
        setError(null);

        // Development mode: Auto-verify
        if (process.env.NODE_ENV === 'development') {
          console.log("Development mode: Auto-verifying email");
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.isVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
          setVerified(true);
          setStatus('success');
          toast.success("Email verified successfully (Development Mode)!");
          setTimeout(() => navigate("/dashboard"), 2000);
          return;
        }

        const token = searchParams.get("token");
        if (!token) {
          setError("No verification token found");
          setStatus('error');
          toast.error("Invalid verification link");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        console.log("Verifying email with token:", token);
        const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
        console.log("Verification response:", response.data);

        if (response.data.success || response.data.verified) {
          setVerified(true);
          setStatus('success');
          toast.success("Email verified successfully!");
          
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.isVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
          
          setTimeout(() => navigate("/dashboard"), 2000);
        } else if (response.data.message?.toLowerCase().includes('already verified')) {
          setVerified(true);
          setStatus('success');
          toast.success("Email already verified! Redirecting to dashboard...");
          
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          user.isVerified = true;
          localStorage.setItem("user", JSON.stringify(user));
          
          setTimeout(() => navigate("/dashboard"), 2000);
        } else {
          setStatus('error');
          setError(response.data.message || "Verification failed. Please try again.");
          toast.error(response.data.message || "Verification failed. Please try again.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        const errorMessage = err.response?.data?.msg || err.response?.data?.message || "Verification failed. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  // If we're on the login page with a token, redirect to verify-email
  useEffect(() => {
    const token = searchParams.get("token");
    if (token && window.location.pathname === "/login") {
      navigate(`/verify-email?token=${token}`);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Email Verification</h2>
        </div>

        <div className="bg-white py-5 px-4 shadow-sm rounded-lg border border-gray-100">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-3 text-sm text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                <FiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="mt-3 text-sm text-green-600 font-medium">
                Email verified successfully!
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                <FiMail className="h-5 w-5 text-red-600" />
              </div>
              <p className="mt-3 text-sm text-red-600 font-medium">
                Verification Failed
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {error || "Please try again or contact support"}
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend Verification Email"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 