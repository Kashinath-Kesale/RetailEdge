// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ErrorBoundary from "./components/ErrorBoundary";

import Layout from "./layouts/Layout";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Receipts from "./pages/Receipts";
import Payments from "./pages/Payments";
import ActivityTracker from "./pages/ActivityTracker";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import './App.css';

const App = () => {
  console.log("🔍 App - Rendering App component");
  
  // Add utility function for debugging (accessible from browser console)
  if (typeof window !== 'undefined') {
    window.clearAuthData = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
      console.log("Auth data cleared and page reloaded");
    };
  }
  
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Protected routes */}
              <Route
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                }
              >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="sales" element={<Sales />} />
                <Route path="receipts" element={<Receipts />} />
                <Route path="payments" element={<Payments />} />
                <Route path="activity" element={<ActivityTracker />} />
                <Route path="profile" element={<Profile />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>

              {/* Catch all route - redirect to login for unauthenticated users */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
