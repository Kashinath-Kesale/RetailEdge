import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiShoppingBag, FiEye, FiEyeOff } from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "cashier", // Default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: "admin", label: "Admin", description: "Full access to all features" },
    { value: "cashier", label: "Cashier", description: "Access to sales and payments" },
    { value: "viewer", label: "Viewer", description: "View-only" },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axiosInstance.post("/signup", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (data.token && data.user) {
        login(data.token, data.user);
        toast.success(`Welcome to RetailEdge, ${data.user.name}!`);

        switch (data.user.role) {
          case "admin":
            navigate("/dashboard");
            break;
          case "cashier":
            navigate("/sales");
            break;
          case "viewer":
            navigate("/products");
            break;
          default:
            navigate("/dashboard");
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.msg || "Registration failed. Please try again.";
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
          <h2 className="mt-6 text-center brand-text text-3xl">RetailEdge</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-style"
                placeholder="Full Name"
              />
            </div>
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-style"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="input-style"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {roles.find((r) => r.value === formData.role)?.description}
              </p>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleChange}
                className="input-style"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-toggle"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-style"
                placeholder="Confirm Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-toggle"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[var(--retailedge-primary)] to-[var(--retailedge-secondary)] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--retailedge-primary)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[var(--retailedge-primary)] hover:text-[var(--retailedge-secondary)] transition-colors duration-300"
              >
                Log in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reusable Tailwind classes
const inputStyle =
  "appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[var(--retailedge-primary)] focus:border-[var(--retailedge-primary)] focus:z-10 sm:text-sm";

const eyeToggleStyle =
  "absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500";

export default Signup;
