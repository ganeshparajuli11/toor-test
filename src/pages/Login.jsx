import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Plane, Hotel, Ship } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import useOAuth from '../hooks/useOAuth';
import SEO from '../components/SEO';
import logo from '../assets/logo.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, forgotPassword } = useAuth();
  const { t } = useLanguage();
  const { loginWithGoogle, loginWithFacebook, isGoogleEnabled, isFacebookEnabled } = useOAuth();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        setTimeout(() => {
          const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
          if (redirectUrl) {
            sessionStorage.removeItem('redirectAfterLogin');
            navigate(redirectUrl);
          } else {
            navigate('/');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    if (provider === 'Google') {
      if (!isGoogleEnabled) {
        toast.error('Google sign-in is not configured. Please contact the administrator.');
        return;
      }
      const result = loginWithGoogle();
      if (!result.success) {
        toast.error(result.message || 'Failed to initiate Google sign-in');
      }
    } else if (provider === 'Facebook') {
      if (!isFacebookEnabled) {
        toast.error('Facebook sign-in is not configured. Please contact the administrator.');
        return;
      }
      const result = loginWithFacebook();
      if (!result.success) {
        toast.error(result.message || 'Failed to initiate Facebook sign-in');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e?.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setShowForgotPassword(false);
      setForgotEmail('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Sign In - Zanafly | Welcome Back"
        description="Sign in to your Zanafly account to access exclusive travel deals, manage bookings, and explore amazing destinations worldwide."
        keywords="sign in, login, travel account, Zanafly login, member access"
        canonical={`${window.location.origin}/login`}
      />

      <div className="login-page">
        {/* Animated Background */}
        <div className="login-bg">
          <div className="login-bg-gradient"></div>
          <div className="login-bg-pattern"></div>
          <div className="floating-icons">
            <Plane className="float-icon icon-1" size={32} />
            <Hotel className="float-icon icon-2" size={28} />
            <Ship className="float-icon icon-3" size={30} />
            <Plane className="float-icon icon-4" size={24} />
            <Hotel className="float-icon icon-5" size={26} />
          </div>
        </div>

        {/* Login Card */}
        <div className="login-card">
          {/* Logo */}
          <Link to="/" className="login-logo">
            <img src={logo} alt="Zanafly" />
          </Link>

          {/* Header */}
          <div className="login-header">
            <h1>{t('Welcome Back')}</h1>
            <p>{t('Sign in to continue your journey')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email">{t('Email')}</label>
              <div className={`field-input ${errors.email ? 'error' : ''}`}>
                <span className="field-icon">
                  <Mail size={20} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label htmlFor="password">{t('Password')}</label>
              <div className={`field-input ${errors.password ? 'error' : ''}`}>
                <span className="field-icon">
                  <Lock size={20} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            {/* Options Row */}
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                <span>{t('Remember me')}</span>
              </label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => setShowForgotPassword(true)}
              >
                {t('Forgot password?')}
              </button>
            </div>

            {/* Submit Button */}
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Signing in...
                </span>
              ) : (
                <>
                  {t('Sign In')}
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span>{t('or continue with')}</span>
            </div>

            {/* Social Login */}
            <div className="social-login">
              <button
                type="button"
                className="social-btn google"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="social-btn facebook"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="signup-link">
              {t("Don't have an account?")}{' '}
              <Link to="/signup">{t('Create one')}</Link>
            </p>
          </form>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-overlay" onClick={() => setShowForgotPassword(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t('Reset Password')}</h2>
              <p>{t("Enter your email and we'll send you a reset link.")}</p>

              <div className="form-field">
                <div className="field-input">
                  <span className="field-icon">
                    <Mail size={20} />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn cancel"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotEmail('');
                  }}
                >
                  {t('Cancel')}
                </button>
                <button
                  type="button"
                  className="modal-btn primary"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : t('Send Reset Link')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
