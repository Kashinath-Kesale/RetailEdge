import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Sending forgot password request for email:", email);
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email,
      });

      console.log("Forgot password response:", response.data);
      toast.success(response.data.msg);
      
      // In development, redirect to reset password page with the token
      if (response.data.resetToken) {
        console.log("Redirecting to reset password page with token:", response.data.resetToken);
        const resetUrl = `/reset-password?token=${response.data.resetToken}`;
        console.log("Reset URL:", resetUrl);
        navigate(resetUrl);
      } else {
        console.log("No reset token in response");
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      const errorMessage = error.response?.data?.msg || "Failed to send reset link";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Forgot Password
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
} 