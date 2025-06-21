import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiLock, FiShoppingBag } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (token) {
      console.log("Found verification token in URL, redirecting to verify-email page");
      navigate(`/verify-email?token=${token}`);
    }
  }, [location.search, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        setLoading(false);
        return;
      }

      console.log("🔍 Login - Sending login request with data:", formData);
      const response = await axiosInstance.post("/api/auth/login", formData);
      console.log("🔍 Login - Login response:", response.data);

      if (response.data.token) {
        const userData = {
          ...response.data.user,
          isVerified: Boolean(response.data.user.isVerified),
        };
        
        console.log("🔍 Login - User data prepared:", userData);
        
        // Use the login method from AuthContext to update authentication state
        login(response.data.token, userData);
        console.log("🔍 Login - AuthContext login method called");

        if (!userData.isVerified) {
          console.log("🔍 Login - User not verified, redirecting to verify-email");
          toast.info("Please verify your email before proceeding");
          navigate("/verify-email");
          return;
        }

        console.log("🔍 Login - User verified, redirecting to dashboard");
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("🔍 Login - Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.msg ||
        "Login failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 justify-center items-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md">
        <div className="text-center mb-6">
          <FiShoppingBag className="h-8 w-8 text-[var(--retailedge-primary)] mx-auto" />
          <h2 className="mt-2 text-2xl font-bold brand-text">RetailEdge</h2>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-2 px-4 text-sm font-medium text-white bg-indigo-600 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
