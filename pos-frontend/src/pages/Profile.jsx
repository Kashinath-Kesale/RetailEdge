import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiEdit2, FiLock, FiX, FiSave } from "react-icons/fi";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { auth, login } = useAuth();
  const { user } = auth;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
  });

  if (!user) return <p>Loading profile...</p>;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put("/api/auth/profile", formData);
      login(auth.token, response.data.user);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: user?.name || "" });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Personal Information</h3>
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Your name"
                />
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiEdit2 size={16} />
                  </button>
                ) : (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                    <button
                      type="submit"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <FiSave size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h3>
            <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-sm text-gray-900">{user.email}</span>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Account Information</h3>
            <div className="space-y-3">
              <div className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-sm text-gray-900 capitalize">{user.role}</span>
              </div>
              <button
                onClick={() => navigate('/change-password')}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <FiLock size={16} />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 