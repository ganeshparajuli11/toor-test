import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

/**
 * Authentication Context
 * Manages user authentication state across the application
 */
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Login function
   * In production, this would call your API endpoint
   */
  const login = async (email, password) => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.post(API_ENDPOINTS.LOGIN, { email, password });

      // Demo user data for now
      const userData = {
        id: 1,
        name: 'John Doe',
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent('John Doe')}&background=06b6d4&color=fff`,
        phone: '+1 234 567 8900',
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  /**
   * Signup function
   * In production, this would call your API endpoint
   */
  const signup = async (name, email, password, phoneNumber = '') => {
    try {
      // TODO: Replace with actual API call
      // const response = await axios.post(API_ENDPOINTS.SIGNUP, { name, email, password, phoneNumber });

      // Store user data with all provided information
      const userData = {
        id: Date.now(),
        name: name,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=06b6d4&color=fff`,
        phone: phoneNumber,
        location: '',
        bio: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('Account created successfully!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Signup failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  /**
   * Update user profile
   */
  const updateProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    toast.success('Profile updated successfully');
  };

  /**
   * Social login (Google/Facebook)
   * Creates or logs in user from OAuth provider data
   */
  const socialLogin = async (oauthUser) => {
    try {
      // Create user data from OAuth response
      const userData = {
        id: oauthUser.id || Date.now(),
        name: oauthUser.name,
        email: oauthUser.email,
        avatar: oauthUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(oauthUser.name)}&background=06b6d4&color=fff`,
        phone: '',
        location: '',
        bio: '',
        dateOfBirth: '',
        gender: '',
        nationality: '',
        provider: oauthUser.provider, // 'google' or 'facebook'
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (error) {
      console.error('Social login error:', error);
      toast.error('Social login failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateProfile,
    socialLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * Usage: const { user, login, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
