import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = new URLSearchParams(location.search).get("token");
      console.log("Verification token:", token);

      if (!token) {
        console.log("No verification token found");
        setError("No verification token found");
        setLoading(false);
        return;
      }

      try {
        setVerifying(true);
        console.log("Sending verification request");
        const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
        console.log("Verification response:", response.data);

        if (response.data.verified || response.data.success) {
          setVerified(true);
          toast.success("Email verified successfully! Please log in to continue.");
          
          // Clear any existing auth data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError(response.data.message || "Verification failed");
          toast.error(response.data.message || "Verification failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        const errorMessage = error.response?.data?.message || error.response?.data?.msg || "Verification failed";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  const handleResendVerification = async () => {
    try {
      setResending(true);
      const response = await axiosInstance.post("/auth/resend-verification");
      console.log("Resend verification response:", response.data);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error) {
      console.error("Resend verification error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.msg || "Failed to resend verification email";
      toast.error(errorMessage);
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <FiMail className="h-8 w-8 text-indigo-600 mx-auto" />
          <h2 className="mt-2 text-xl font-bold text-gray-900">Email Verification</h2>
          <p className="mt-1 text-xs text-gray-500">Verify your email to continue</p>
        </div>

        <div className="bg-white py-5 px-4 shadow-md rounded-lg border border-gray-100">
          {verified ? (
            <div className="text-center">
              <FiCheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="mt-4 text-sm text-gray-600">Your email has been verified successfully!</p>
              <p className="mt-2 text-sm text-gray-500">Redirecting to login...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="mt-4 text-sm text-gray-600">{error}</p>
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className={`mt-4 w-full flex justify-center py-1.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
                  resending ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {resending ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Resending...
                  </div>
                ) : (
                  "Resend Verification Email"
                )}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-sm text-gray-600">Verifying your email...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 