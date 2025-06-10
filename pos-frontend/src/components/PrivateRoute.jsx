import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, auth } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access control
  const currentPath = location.pathname;
  const userRole = auth.user?.role;

  // Check if user has access to the current route
  if (currentPath === '/payments' || currentPath === '/sales') {
    if (userRole === 'viewer') {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 