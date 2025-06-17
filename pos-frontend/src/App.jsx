// src/App.jsx
import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import './App.css';

const App = () => {
  return (
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
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="sales" element={<Sales />} />
              <Route path="receipts" element={<Receipts />} />
              <Route path="payments" element={<Payments />} />
              <Route path="profile" element={<Profile />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
