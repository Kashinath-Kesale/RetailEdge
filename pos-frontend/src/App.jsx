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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
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

    // Add utility to check current session info
    window.getSessionInfo = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return {
            token: token.substring(0, 20) + '...',
            user: user ? JSON.parse(user) : null,
            sessionId: payload.sessionId,
            loginTimestamp: payload.loginTimestamp,
            expiresAt: new Date(payload.exp * 1000),
            userId: payload.userId
          };
        } catch (error) {
          return { error: 'Invalid token format' };
        }
      }
      return { error: 'No token found' };
    };

    // Add utility to simulate multiple sessions
    window.testMultipleSessions = () => {
      console.log("🧪 Testing multiple sessions...");
      console.log("Current session:", window.getSessionInfo());
      console.log("To test multiple users:");
      console.log("1. Open a new incognito/private window");
      console.log("2. Login with a different user account");
      console.log("3. Both sessions should work independently");
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
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="sales" element={<Sales />} />
                <Route path="payments" element={<Payments />} />
                <Route path="receipts" element={<Receipts />} />
                <Route path="activity" element={<ActivityTracker />} />
                <Route path="profile" element={<Profile />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="about" element={<About />} />
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
