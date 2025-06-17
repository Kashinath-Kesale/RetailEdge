import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";
import { FiUser, FiMail, FiLock, FiShoppingBag, FiChevronDown } from "react-icons/fi";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "viewer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Validate password strength
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        setLoading(false);
        return;
      }

      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = formData;

      console.log("Sending signup request with data:", signupData);
      const response = await axiosInstance.post("/api/auth/signup", signupData);
      console.log("Signup response:", response.data);

      if (response.status === 201) {
        toast.success(response.data.message || "Account created successfully! Please check your email for verification.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || error.response?.data?.msg || "Failed to create account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: "admin", label: "Admin - Full system access" },
    { value: "cashier", label: "Cashier - Process transactions" },
    { value: "viewer", label: "Viewer - View reports" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 justify-center items-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md">
        <div className="text-center mb-6">
          <FiShoppingBag className="h-8 w-8 text-[var(--retailedge-primary)] mx-auto" />
          <h2 className="mt-2 text-2xl font-bold brand-text">RetailEdge</h2>
          <p className="mt-1 text-sm text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder="Enter your name"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
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
                autoComplete="new-password"
                placeholder="••••••••"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Select Your Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none bg-white"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronDown className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
