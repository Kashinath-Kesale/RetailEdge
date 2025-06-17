import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiMenu,
  FiX,
  FiGrid,
  FiShoppingBag,
  FiDollarSign,
  FiShoppingCart,
  FiFileText,
  FiUser,
  FiInfo,
  FiLogOut,
} from "react-icons/fi";
import { toast } from "react-toastify";
import About from "../pages/About";
import LowStockNotifier from "../components/LowStockNotifier";

const Layout = () => {
  const [open, setOpen] = useState(window.innerWidth >= 1024);
  const [showAbout, setShowAbout] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout, userRole } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Define menu items based on user role
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FiGrid /> },
    { name: "Products", path: "/products", icon: <FiShoppingBag /> },
    { name: "Sales", path: "/sales", icon: <FiShoppingCart /> },
    { name: "Receipts", path: "/receipts", icon: <FiFileText /> },
    { name: "Payments", path: "/payments", icon: <FiDollarSign /> },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    switch (item.path) {
      case "/products":
        return userRole === "admin" || userRole === "viewer";
      case "/sales":
        return userRole === "admin" || userRole === "cashier";
      case "/receipts":
        return userRole === "admin" || userRole === "cashier" || userRole === "viewer";
      case "/payments":
        return userRole === "admin" || userRole === "cashier";
      default:
        return true; // Dashboard is always visible
    }
  });

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <LowStockNotifier />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-12 xs:h-14 sm:h-16 bg-white shadow-md z-40 flex items-center justify-between px-2 xs:px-3 sm:px-4 transition-all duration-300">
        <div className="flex items-center">
          <div
            className={`group flex items-center ${open ? "w-full px-1 py-1.5 xs:py-2 sm:py-2.5 justify-start" : "w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 justify-center"} rounded-lg hover:bg-gray-100 transition-all duration-300`}
            onClick={() => setOpen(!open)}
            title="Toggle Sidebar"
          >
            {open ? (
              <FiX size={18} className="xs:text-xl sm:text-2xl text-gray-700" />
            ) : (
              <FiMenu size={18} className="xs:text-xl sm:text-2xl text-gray-700" />
            )}
          </div>
          <div className="flex items-center ml-1.5 xs:ml-2 sm:ml-3">
            <FiShoppingBag className="text-[var(--retailedge-primary)] text-lg xs:text-xl sm:text-2xl mr-1 xs:mr-1.5 sm:mr-2" />
            <h1 className="text-base xs:text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RetailEdge
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-1 xs:p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 text-gray-700"
            title="View Profile"
          >
            <FiUser size={18} className="xs:text-xl sm:text-2xl" />
          </button>
          <button
            onClick={handleLogout}
            className="p-1 xs:p-1.5 sm:p-2 rounded-lg hover:bg-red-100 transition-all duration-300 text-red-600"
            title="Logout"
          >
            <FiLogOut size={18} className="xs:text-xl sm:text-2xl" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-12 xs:top-14 sm:top-16 left-0 h-[calc(100vh-3rem)] xs:h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-30 ${
          open ? "w-48 xs:w-56 sm:w-64" : "w-12 xs:w-14 sm:w-16"
        }`}
      >
        <nav className="h-full flex flex-col">
          <div className="flex-1 flex flex-col gap-0.5 sm:gap-1 py-1.5 xs:py-2 sm:py-4">
            {filteredMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group flex items-center ${
                  open
                    ? "w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 justify-start"
                    : "w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 justify-center mx-auto"
                } text-gray-700 hover:bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-all duration-300 rounded-lg relative overflow-hidden ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20"
                    : ""
                }`}
                title={item.name}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <span className="text-base xs:text-lg sm:text-xl">{item.icon}</span>
                {open && (
                  <span className="ml-1.5 xs:ml-2 sm:ml-3 relative group-hover:translate-x-1 transition-transform duration-300 text-xs xs:text-sm sm:text-base">
                    {item.name}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* About Button at Bottom */}
          <div className="p-1 xs:p-1.5 sm:p-2 border-t border-gray-200">
            <button
              onClick={() => setShowAbout(true)}
              className={`group flex items-center ${
                open
                  ? "w-full px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 justify-start"
                  : "w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 justify-center mx-auto"
              } text-gray-700 hover:bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 transition-all duration-300 rounded-lg relative overflow-hidden group-hover:shadow-lg`}
              title="About"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <FiInfo className="text-sm xs:text-base sm:text-lg group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 group-hover:text-blue-600" />
              {open && (
                <span className="ml-1.5 xs:ml-2 sm:ml-3 relative group-hover:translate-x-1 transition-transform duration-300 text-xs xs:text-sm sm:text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-blue-600 to-purple-600">
                  About
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          open ? "ml-48 xs:ml-56 sm:ml-64" : "ml-12 xs:ml-14 sm:ml-16"
        }`}
      >
        <main className="pt-12 xs:pt-14 sm:pt-16 min-h-screen">
          <div className="p-2 xs:p-4 sm:p-6">
            <Outlet />
          </div>
        </main>

        <About isOpen={showAbout} onClose={() => setShowAbout(false)} />

        {showMobileMenu && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
