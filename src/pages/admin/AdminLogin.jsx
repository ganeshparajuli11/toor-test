import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './AdminLogin.css';

// Use environment variable for API URL or default to relative path for production
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

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
      {/* Background */}
      <div className="admin-login-bg">
        <div className="admin-bg-gradient"></div>
        <div className="admin-bg-pattern"></div>
        <div className="admin-bg-glow glow-1"></div>
        <div className="admin-bg-glow glow-2"></div>
      </div>

      {/* Login Card */}
      <div className="admin-login-card">
        {/* Logo/Icon */}
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <Shield size={32} />
          </div>
        </div>

        {/* Header */}
        <div className="admin-login-header">
          <h1>Admin Portal</h1>
          <p>Sign in to access the dashboard</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          {/* Email Field */}
          <div className="admin-form-field">
            <label htmlFor="email">Email Address</label>
            <div className={`admin-field-input ${errors.email ? 'error' : ''}`}>
              <span className="admin-field-icon">
                <Mail size={20} />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="admin-field-error">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="admin-form-field">
            <label htmlFor="password">Password</label>
            <div className={`admin-field-input ${errors.password ? 'error' : ''}`}>
              <span className="admin-field-icon">
                <Lock size={20} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="admin-field-error">{errors.password}</span>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="admin-submit-error">
              <AlertCircle size={18} />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? (
              <span className="admin-btn-loading">
                <span className="admin-spinner"></span>
                Signing in...
              </span>
            ) : (
              <>
                Access Dashboard
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="admin-login-footer">
          <div className="security-badge">
            <Shield size={14} />
            <span>Secure Admin Access</span>
          </div>
          <p>Protected area. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
