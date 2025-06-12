import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiCheckCircle } from "react-icons/fi";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");
        if (!token) {
          toast.error("Invalid verification link");
          navigate("/login");
          return;
        }

        console.log("Verifying email with token:", token);
        const response = await axiosInstance.get(`/api/auth/verify-email?token=${token}`);
        console.log("Verification response:", response.data);

        if (response.data.msg) {
          toast.success(response.data.msg);
        } else {
          toast.success("Email verified successfully!");
        }
        
        // Redirect to login after successful verification
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error) {
        console.error("Verification error:", error);
        const errorMessage = error.response?.data?.msg || "Email verification failed";
        toast.error(errorMessage);
        
        // Redirect to login after error
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <FiMail className="mx-auto h-12 w-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">
          {verifying ? "Verifying your email..." : "Verification Complete"}
        </h2>
        <div className="text-center">
          {verifying ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          ) : (
            <div className="flex flex-col items-center">
              <FiCheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-gray-600">
                You will be redirected to the login page shortly...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 