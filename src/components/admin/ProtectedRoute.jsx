import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      const refreshToken = localStorage.getItem('adminRefreshToken');

      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify the token by calling the /auth/me endpoint
        const response = await axios.get(`${API_URL}/api/admin/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // Update stored admin info
          localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
          setIsAuthenticated(true);
        } else {
          throw new Error('Verification failed');
        }
      } catch (error) {
        console.error('Token verification failed:', error);

        // Try to refresh the token
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_URL}/api/admin/auth/refresh`, {
              refreshToken
            });

            if (refreshResponse.data.success) {
              localStorage.setItem('adminToken', refreshResponse.data.accessToken);
              localStorage.setItem('adminRefreshToken', refreshResponse.data.refreshToken);
              setIsAuthenticated(true);
            } else {
              throw new Error('Refresh failed');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear invalid tokens
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');
            setIsAuthenticated(false);
          }
        } else {
          // No refresh token, clear everything
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminUser');
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  // Show loading state while verifying
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#f5f5f5'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e0e0e0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666', fontSize: '14px' }}>Verifying authentication...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
