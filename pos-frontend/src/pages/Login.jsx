import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FiShoppingBag, FiEye, FiEyeOff } from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Clear any existing tokens when the login page loads
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Check if there's a verification token in the URL
    const token = searchParams.get("token");
    if (token) {
      verifyEmail(token);
    }

    // Check if there's a verification success message
    const verified = searchParams.get("verified");
    if (verified === "true") {
      toast.success("Email verified successfully! You can now log in.");
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      console.log("Verifying email with token:", token);
      const response = await axiosInstance.get(`/api/auth/verify-email?token=${token}`);
      console.log("Verification response:", response.data);
      toast.success(response.data.msg || "Email verified successfully!");
    } catch (error) {
      console.error("Verification error:", error);
      const errorMessage = error.response?.data?.msg || "Email verification failed";
      toast.error(errorMessage);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear any existing tokens before login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const loginData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      console.log("Attempting login with:", { email: loginData.email });
      const response = await axiosInstance.post("/api/auth/login", loginData);
      console.log("Login response:", response.data);
      
      if (response.data.token && response.data.user) {
        // Store user data and token
        login(response.data.token, response.data.user);
        
        // Show success message
        toast.success(`Welcome back, ${response.data.user.name}!`);
        
        // Redirect based on role
        const role = response.data.user.role;
        switch (role) {
          case 'admin':
            navigate("/dashboard");
            break;
          case 'cashier':
            navigate("/sales");
            break;
          case 'viewer':
            navigate("/products");
            break;
          default:
            navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.msg || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <FiShoppingBag className="text-[var(--retailedge-primary)] text-4xl" />
          </div>
          <h2 className="mt-6 text-center brand-text text-3xl">
            RetailEdge
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--retailedge-primary)] focus:border-[var(--retailedge-primary)] focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--retailedge-primary)] focus:border-[var(--retailedge-primary)] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-[var(--retailedge-primary)] hover:text-[var(--retailedge-secondary)] transition-colors duration-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[var(--retailedge-primary)] to-[var(--retailedge-secondary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--retailedge-primary)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-[var(--retailedge-primary)] hover:text-[var(--retailedge-secondary)] transition-colors duration-300"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;