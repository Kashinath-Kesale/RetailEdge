import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiLock, FiShoppingBag } from "react-icons/fi";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for verification token in URL
    const token = searchParams.get("token");
    if (token) {
      console.log("Found verification token in URL, redirecting to verify-email page");
      navigate(`/verify-email?token=${token}`);
    }
  }, [searchParams, navigate]);

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
    setError(null);

    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      console.log("Sending login request with data:", {
        email: formData.email,
        password: formData.password,
      });

      const response = await axiosInstance.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login response:", response.data);

      if (response.data.success || response.data.token) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Show success message
        toast.success("Login successful!");
        
        // Force a small delay to ensure localStorage is updated
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          navigate("/dashboard", { replace: true });
        }, 100);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.msg || "Login failed. Please try again.");
      toast.error(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <FiShoppingBag className="h-8 w-8 text-indigo-600 mx-auto" />
          <h2 className="mt-2 text-xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-1 text-xs text-gray-500">Sign in to your RetailEdge account</p>
        </div>

        <div className="bg-white py-5 px-4 shadow-sm rounded-lg border border-gray-100">
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 text-sm border-gray-300 rounded-md transition duration-150 ease-in-out h-9"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 text-sm border-gray-300 rounded-md transition duration-150 ease-in-out h-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-1.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Don't have an account?</span>
              </div>
            </div>

            <div className="mt-3">
              <Link
                to="/signup"
                className="w-full flex justify-center py-1.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Create a new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 