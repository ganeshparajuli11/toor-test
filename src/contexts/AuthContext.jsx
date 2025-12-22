import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.service';

/**
 * Authentication Context
 * Manages user authentication state across the application
 */
const AuthContext = createContext(null);

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Get stored tokens
   */
  const getTokens = () => ({
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY)
  });

  /**
   * Store tokens
   */
  const storeTokens = (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  /**
   * Clear tokens and user data
   */
  const clearAuth = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  /**
   * Refresh access token
   */
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing) return null;

    const { refreshToken } = getTokens();
    if (!refreshToken) return null;

    setIsRefreshing(true);
    try {
      const response = await api.post('/auth/refresh', { refreshToken });

      if (response.data?.success) {
        storeTokens(response.data.accessToken, response.data.refreshToken);
        return response.data.accessToken;
      }
      return null;
    } catch (error) {
      console.error('[Auth] Token refresh failed:', error);
      clearAuth();
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { accessToken } = getTokens();
        const storedUser = localStorage.getItem(USER_KEY);

        if (!accessToken) {
          setLoading(false);
          return;
        }

        // If we have a stored user, use it immediately
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Verify token with server
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          if (response.data?.success) {
            const userData = response.data.user;
            setUser(userData);
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
          } else {
            // Try refresh
            const newToken = await refreshAccessToken();
            if (!newToken) {
              clearAuth();
            }
          }
        } catch (error) {
          // Token might be expired, try refresh
          if (error.response?.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) {
              // Retry with new token
              const retryResponse = await api.get('/auth/me', {
                headers: { Authorization: `Bearer ${newToken}` }
              });
              if (retryResponse.data?.success) {
                setUser(retryResponse.data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(retryResponse.data.user));
              }
            } else {
              clearAuth();
            }
          } else {
            console.error('[Auth] Check auth error:', error);
          }
        }
      } catch (error) {
        console.error('[Auth] Error loading user:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [refreshAccessToken]);

  /**
   * Login function
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.success) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Store tokens and user
        storeTokens(accessToken, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);

        toast.success('Login successful!');
        return { success: true, user: userData };
      } else {
        const errorMsg = response.data?.error || 'Login failed';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('[Auth] Login error:', error);
      const errorMsg = error.response?.data?.error || 'Login failed. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Signup function
   */
  const signup = async (firstName, lastName, email, password, phone = '') => {
    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        phone
      });

      if (response.data?.success) {
        const { user: userData, accessToken, refreshToken, message } = response.data;

        // Store tokens and user
        storeTokens(accessToken, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);

        toast.success(message || 'Account created! Please check your email to verify.');
        return { success: true, user: userData, message };
      } else {
        const errorMsg = response.data?.error || 'Signup failed';
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (error) {
      console.error('[Auth] Signup error:', error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMsg = errors.map(e => e.message).join('. ');
        toast.error(errorMsg);
        return { success: false, error: errorMsg, errors };
      }

      const errorMsg = error.response?.data?.error || 'Signup failed. Please try again.';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Logout function
   */
  const logout = async () => {
    try {
      const { accessToken } = getTokens();
      if (accessToken) {
        await api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        }).catch(() => {}); // Ignore errors
      }
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updates) => {
    try {
      const { accessToken } = getTokens();
      const response = await api.put('/auth/profile', updates, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data?.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        toast.success('Profile updated successfully');
        return { success: true, user: updatedUser };
      } else {
        toast.error(response.data?.error || 'Update failed');
        return { success: false, error: response.data?.error };
      }
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to update profile';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Change password
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { accessToken } = getTokens();
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.data?.success) {
        toast.success('Password changed successfully');
        return { success: true };
      } else {
        toast.error(response.data?.error || 'Failed to change password');
        return { success: false, error: response.data?.error };
      }
    } catch (error) {
      console.error('[Auth] Change password error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to change password';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Verify email
   */
  const verifyEmail = async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });

      if (response.data?.success) {
        // Update user's verified status
        if (user) {
          const updatedUser = { ...user, isVerified: true };
          setUser(updatedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        }
        toast.success('Email verified successfully!');
        return { success: true };
      } else {
        toast.error(response.data?.error || 'Verification failed');
        return { success: false, error: response.data?.error };
      }
    } catch (error) {
      console.error('[Auth] Verify email error:', error);
      const errorMsg = error.response?.data?.error || 'Email verification failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Resend verification email
   */
  const resendVerification = async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });

      if (response.data?.success) {
        toast.success('Verification email sent!');
        return { success: true };
      } else {
        toast.error(response.data?.error || 'Failed to send verification email');
        return { success: false, error: response.data?.error };
      }
    } catch (error) {
      console.error('[Auth] Resend verification error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to send verification email';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Forgot password
   */
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });

      if (response.data?.success) {
        toast.success('Password reset email sent!');
        return { success: true, message: response.data.message };
      } else {
        toast.error(response.data?.error || 'Failed to send reset email');
        return { success: false, error: response.data?.error };
      }
    } catch (error) {
      console.error('[Auth] Forgot password error:', error);
      // Don't reveal if email exists
      toast.success('If an account exists, a reset email has been sent.');
      return { success: true };
    }
  };

  /**
   * Reset password
   */
  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: newPassword
      });

      if (response.data?.success) {
        toast.success('Password reset successful! You can now login.');
        return { success: true };
      } else {
        toast.error(response.data?.error || 'Password reset failed');
        return { success: false, error: response.data?.error };
      }
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      const errorMsg = error.response?.data?.error || 'Password reset failed';
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  /**
   * Social login (Google/Facebook)
   */
  const socialLogin = async (oauthUser) => {
    try {
      // For now, create a local user from OAuth data
      // In production, you would send this to backend to create/find user
      const userData = {
        id: oauthUser.id || Date.now().toString(),
        firstName: oauthUser.given_name || oauthUser.name?.split(' ')[0] || 'User',
        lastName: oauthUser.family_name || oauthUser.name?.split(' ').slice(1).join(' ') || '',
        email: oauthUser.email,
        avatar: oauthUser.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(oauthUser.name || 'User')}&background=06b6d4&color=fff`,
        phone: '',
        isVerified: true, // OAuth users are pre-verified
        provider: oauthUser.provider,
        createdAt: new Date().toISOString(),
      };

      setUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      toast.success('Login successful!');
      return { success: true, user: userData };
    } catch (error) {
      console.error('[Auth] Social login error:', error);
      toast.error('Social login failed. Please try again.');
      return { success: false, error: error.message };
    }
  };

  /**
   * Get auth headers for API calls
   */
  const getAuthHeaders = () => {
    const { accessToken } = getTokens();
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isVerified: user?.isVerified || false,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    socialLogin,
    getAuthHeaders,
    refreshAccessToken
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
