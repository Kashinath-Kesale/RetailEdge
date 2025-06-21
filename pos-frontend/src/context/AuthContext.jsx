// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../api/axiosInstance";

// Create Auth context
const AuthContext = createContext();

// AuthProvider wraps the entire app
export const AuthProvider = ({ children }) => {
  // Get user from localStorage on load
  const getUserFromStorage = () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  };

  // Auth state contains token and user
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || "",
    user: getUserFromStorage(),
  });

  console.log("🔍 AuthContext - Initial state:", {
    token: !!auth.token,
    user: auth.user,
    isAuthenticated: !!auth.token && !!auth.user,
    isVerified: auth.user?.isVerified
  });

  // Logout method — clears token and user from state and localStorage
  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint for activity logging
      await axiosInstance.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuth({ token: "", user: null });
      delete axiosInstance.defaults.headers.common["Authorization"];
      toast.success("Logged out successfully");
    }
  }, []);

  // Verify token and update user data on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Set default headers for all requests
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          
          // Get user data from localStorage
          const user = getUserFromStorage();
          if (user) {
            console.log("🔍 AuthContext - Setting auth state from localStorage:", { token: !!token, user });
            setAuth({ token, user });
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
    };

    verifyToken();
  }, [logout]);

  // Login method — saves token and user to both state and localStorage
  const login = useCallback((token, user) => {
    console.log("🔍 AuthContext - Login called with:", { token: !!token, user });
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
    
    // Set default headers for all requests
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("🔍 AuthContext - Auth state updated:", { token: !!token, user });
  }, []);

  // Update user method — updates only user data without changing token
  const updateUser = useCallback((userData) => {
    console.log("🔍 AuthContext - Update user called with:", userData);
    const updatedUser = { ...auth.user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setAuth(prev => ({ ...prev, user: updatedUser }));
    console.log("🔍 AuthContext - User data updated:", updatedUser);
  }, [auth.user]);

  // Authenticated state
  const isAuthenticated = !!auth.token && !!auth.user;
  const isVerified = auth.user?.isVerified === true;
  const userRole = auth.user?.role || "viewer";

  console.log("🔍 AuthContext - Current state:", {
    isAuthenticated,
    isVerified,
    userRole,
    token: !!auth.token,
    user: auth.user
  });

  return (
    <AuthContext.Provider 
      value={{ 
        auth, 
        login, 
        logout, 
        isAuthenticated,
        isVerified,
        userRole,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
