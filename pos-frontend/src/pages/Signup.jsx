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
      const { name, email, password, confirmPassword } = formData;
      if (!name || !email || !password || !confirmPassword) {
        toast.error("All fields are required");
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const { confirmPassword: _, ...signupData } = formData;
      await axiosInstance.post("/api/auth/signup", signupData);
      toast.success("Signup successful! Please verify your email.");
      navigate("/login");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.response?.data?.msg || "Signup failed";
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <FiShoppingBag className="h-8 w-8 text-indigo-600 mx-auto" />
          <h2 className="mt-2 text-xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-1 text-xs text-gray-500">
            Join RetailEdge and start managing your business
          </p>
        </div>

        <div className="bg-white py-5 px-4 shadow-md rounded-lg border border-gray-100">
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Name Field */}
            <InputField
              label="Full Name"
              id="name"
              name="name"
              type="text"
              icon={<FiUser className="h-4 w-4 text-gray-400" />}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
            />

            {/* Email Field */}
            <InputField
              label="Email address"
              id="email"
              name="email"
              type="email"
              icon={<FiMail className="h-4 w-4 text-gray-400" />}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />

            {/* Password Field */}
            <InputField
              label="Password"
              id="password"
              name="password"
              type="password"
              icon={<FiLock className="h-4 w-4 text-gray-400" />}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />

            {/* Confirm Password Field */}
            <InputField
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              icon={<FiLock className="h-4 w-4 text-gray-400" />}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-xs font-medium text-gray-700 mb-1">
                Select Your Role
              </label>
              <div className="relative rounded-md shadow-sm">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-8 text-sm border-gray-300 rounded-md transition duration-150 ease-in-out h-9 appearance-none bg-white"
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-1.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <LoadingSpinner text="Creating account..." />
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>

          {/* Already have account */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-3">
              <Link
                to="/login"
                className="w-full flex justify-center py-1.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable input field component
const InputField = ({ label, id, name, type, icon, placeholder, value, onChange }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-8 text-sm border-gray-300 rounded-md transition duration-150 ease-in-out h-9"
        placeholder={placeholder}
      />
    </div>
  </div>
);

// Spinner with optional text
const LoadingSpinner = ({ text }) => (
  <div className="flex items-center">
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 
        1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    {text}
  </div>
);

export default Signup;
