import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // TEMPORARY: Authentication bypassed for development
  // TODO: Enable authentication when backend is ready
  const isAuthenticated = true; // Bypassing login for now

  // Uncomment below when authentication is needed:
  // const isAuthenticated = localStorage.getItem('adminToken');

  if (!isAuthenticated) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
