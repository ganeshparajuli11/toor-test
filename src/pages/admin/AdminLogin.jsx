import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './AdminLogin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(`${API_URL}/api/admin/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        // Store admin tokens and info
        localStorage.setItem('adminToken', response.data.accessToken);
        localStorage.setItem('adminRefreshToken', response.data.refreshToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.admin));

        toast.success('Login successful!');
        navigate('/admin');
      }
    } catch (error) {
      console.error('Admin login error:', error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          setErrors({ submit: 'Invalid email or password' });
          toast.error('Invalid email or password');
        } else if (status === 403) {
          setErrors({ submit: data.error || 'Account is deactivated' });
          toast.error(data.error || 'Account is deactivated');
        } else if (status === 429) {
          setErrors({ submit: data.error || 'Too many login attempts' });
          toast.error(data.error || 'Too many login attempts. Please try again later.');
        } else if (data.errors) {
          // Validation errors
          const fieldErrors = {};
          data.errors.forEach(err => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
          toast.error('Please check the form for errors');
        } else {
          setErrors({ submit: data.error || 'Login failed' });
          toast.error(data.error || 'Login failed. Please try again.');
        }
      } else {
        setErrors({ submit: 'Network error. Please check your connection.' });
        toast.error('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <Shield size={48} className="logo-icon" />
            </div>
            <h1 className="login-title">Admin Login</h1>
            <p className="login-subtitle">Sign in to access the admin panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className={`input-wrapper ${errors.email ? 'error' : ''}`}>
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className={`input-wrapper ${errors.password ? 'error' : ''}`}>
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="submit-error">
                <AlertCircle size={18} />
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p className="footer-text">
              Protected admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="login-bg-decoration">
          <div className="decoration-circle circle-1"></div>
          <div className="decoration-circle circle-2"></div>
          <div className="decoration-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
