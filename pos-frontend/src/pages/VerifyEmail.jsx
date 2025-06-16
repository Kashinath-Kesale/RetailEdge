import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiCheckCircle } from "react-icons/fi";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          setStatus('error');
          toast.error("Invalid verification link");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        console.log("Verifying email with token:", token);
        console.log("Base URL:", process.env.REACT_APP_API_URL);
        
        const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
        console.log("Verification response:", response.data);

        if (response.data.success) {
          setStatus('success');
          toast.success("Email verified successfully! You can now login.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setStatus('error');
          toast.error("Verification failed. Please try again.");
          setTimeout(() => navigate("/login"), 2000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus('error');
        const errorMessage = error.response?.data?.message || "Failed to verify email";
        
        if (errorMessage.includes('already verified')) {
          toast.success("Email already verified! You can now log in.");
          setStatus('success');
        } else {
          toast.error(errorMessage);
        }
        
        setTimeout(() => navigate("/login"), 2000);
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
                Redirecting to login page...
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
                Redirecting to login page...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 