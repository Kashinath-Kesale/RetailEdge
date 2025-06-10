// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";

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

  // Login method — saves token and user to both state and localStorage
  const login = useCallback((token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, user });
  }, []);

  // Logout method — clears token and user from state and localStorage
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: "", user: null });
    toast.success("Logged out successfully");
  }, []);

  // Authenticated state
  const isAuthenticated = !!auth.token && !!auth.user;

  return (
    <AuthContext.Provider value={{ auth, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
