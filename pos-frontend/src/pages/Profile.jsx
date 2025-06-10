import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiEdit2, FiLock, FiX, FiMail, FiShield, FiUserCheck, FiSave } from "react-icons/fi";
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
      const response = await axiosInstance.put("/auth/profile", formData);
      login(auth.token, response.data.user);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setFormData({ name: user?.name || "" }); // Reset to original name
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center animate-fadeIn p-4">
      <div className="bg-white rounded-xl p-4 w-full max-w-md animate-slideIn relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <FiUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Profile Settings
              </h2>
              <p className="text-xs text-gray-500">Manage your account settings</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 transform hover:rotate-90 transition-transform duration-300"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Personal Information */}
          <section className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <FiUserCheck className="text-blue-600 mr-2" />
              Personal Information
            </h3>
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-300"
              />
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit Name"
                >
                  <FiEdit2 size={14} />
                </button>
              ) : (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                  <button
                    type="submit"
                    className="text-green-500 hover:text-green-700 transition-colors"
                    title="Save Changes"
                  >
                    <FiSave size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Cancel Edit"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <FiMail className="text-purple-600 mr-2" />
              Contact Information
            </h3>
            <div className="px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
              <span className="text-gray-900 text-sm">{user.email}</span>
            </div>
          </section>

          {/* Account Information */}
          <section className="bg-gradient-to-br from-white to-gray-50 p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <FiShield className="text-green-600 mr-2" />
              Account Information
            </h3>
            <div className="space-y-2">
              <div className="px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
                <span className="text-gray-900 text-sm capitalize">{user.role}</span>
              </div>
              <button
                onClick={() => navigate('/change-password')}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium"
              >
                <FiLock size={14} />
                Change Password
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile; 