import { useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const verifyEmail = useCallback(async (token) => {
    try {
      const res = await axiosInstance.get(`/auth/verify-email?token=${token}`);
      if (res.data.msg === "Email verified successfully") {
        toast.success("Email verified successfully! Please login.");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.msg || "Email verification failed");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    } else {
      toast.error("Invalid verification link");
      navigate("/login");
    }
  }, [searchParams, navigate, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">Verifying your email...</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 