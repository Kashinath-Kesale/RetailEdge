import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiMail, FiLock, FiShoppingBag } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check for verification token
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      navigate(`/verify-email?token=${token}`);
    }
  }, [searchParams, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.email || !formData.password) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    try {
      console.log("Sending login request with data:", { email: formData.email });
      const response = await axiosInstance.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      console.log("Login response:", response.data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success("Login successful!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <FiShoppingBag className="h-9 w-9 text-indigo-600 mx-auto" />
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-1 text-sm text-gray-500">Sign in to your RetailEdge account</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1">Email address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 pr-3 py-2 text-sm w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.372 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.134 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <span className="text-gray-500">Don't have an account?</span>{" "}
            <Link
              to="/signup"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
