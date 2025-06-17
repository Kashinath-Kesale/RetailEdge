import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({ 
  id, 
  name, 
  value, 
  onChange, 
  label, 
  required = false,
  minLength = 6,
  className = "",
  placeholder = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          className={`w-full p-2 pr-10 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 transition-all duration-300 ${className}`}
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          {showPassword ? (
            <FiEyeOff className="w-5 h-5 transform transition-transform duration-300 hover:scale-110" />
          ) : (
            <FiEye className="w-5 h-5 transform transition-transform duration-300 hover:scale-110" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput; 