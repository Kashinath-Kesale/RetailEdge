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
            setAuth({ token, user });
          }
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
    };

    verifyToken();
  }, []);

  // Login method — saves token and user to both state and localStorage
  const login = useCallback((token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
    
    // Set default headers for all requests
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  // Logout method — clears token and user from state and localStorage
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: "", user: null });
    delete axiosInstance.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully");
  }, []);

  // Authenticated state
  const isAuthenticated = !!auth.token && !!auth.user;
  const isVerified = auth.user?.isVerified === true;
  const userRole = auth.user?.role || "viewer";

  return (
    <AuthContext.Provider 
      value={{ 
        auth, 
        login, 
        logout, 
        isAuthenticated,
        isVerified,
        userRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
