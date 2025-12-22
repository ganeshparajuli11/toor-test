import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import useOAuth from '../hooks/useOAuth';
import Button from '../components/Button';
import SEO from '../components/SEO';
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
          navigate('/');
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
        title="Sign In - TOOR | Welcome Back"
        description="Sign in to your TOOR account to access exclusive travel deals, manage bookings, and explore amazing destinations worldwide."
        keywords="sign in, login, travel account, TOOR login, member access"
        canonical={`${window.location.origin}/login`}
      />

      <div className="auth-page">
        {/* Left Panel - Branding */}
        <div className="auth-brand-panel">
          <div className="brand-content">
            <Link to="/" className="brand-logo">
              <img src="/src/assets/logo.png" alt="TOOR" />
            </Link>
            <div className="brand-text">
              <h1>{t('Welcome back')}</h1>
              <p>{t('Find the best deals on hotels, flights, and more')}</p>
            </div>
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>{t('Best Price Guarantee')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>{t('Easy Booking')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <span>{t('24/7 Support')}</span>
              </div>
            </div>
          </div>
          <div className="brand-image">
            <img
              src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=800&fit=crop&q=80"
              alt="Travel"
            />
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel">
          <div className="form-container">
            <div className="mobile-logo">
              <Link to="/">
                <img src="/src/assets/logo.png" alt="TOOR" />
              </Link>
            </div>

            <div className="form-header">
              <h2>{t('Sign In')}</h2>
              <p>{t('Enter your credentials to access your account')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">{t('Email address')}</label>
                <div className="input-with-icon">
                  <Mail className="field-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className={errors.email ? 'error' : ''}
                    {...register('email', {
                      required: t('Email address') + ' is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email.message}</span>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">{t('Password')}</label>
                <div className="input-with-icon">
                  <Lock className="field-icon" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('Password')}
                    className={errors.password ? 'error' : ''}
                    {...register('password', {
                      required: t('Password') + ' is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password.message}</span>}
              </div>

              {/* Remember & Forgot */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  <span>{t('Remember me')}</span>
                </label>
                <button type="button" className="link-button" onClick={() => setShowForgotPassword(true)}>
                  {t('Forgot password?')}
                </button>
              </div>

              {/* Forgot Password Modal */}
              {showForgotPassword && (
                <div className="forgot-password-modal">
                  <div className="forgot-password-content">
                    <h3>{t('Reset Password')}</h3>
                    <p>{t('Enter your email address and we\'ll send you a reset link.')}</p>
                    <div className="form-group">
                      <div className="input-with-icon">
                        <Mail className="field-icon" size={18} />
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="forgot-password-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setForgotEmail('');
                        }}
                      >
                        {t('Cancel')}
                      </button>
                      <Button
                        type="button"
                        loading={isLoading}
                        onClick={handleForgotPassword}
                      >
                        {t('Send Reset Link')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
                {t('Sign In')}
                <ArrowRight size={18} />
              </Button>

              {/* Divider */}
              <div className="divider">
                <span>{t('or continue with')}</span>
              </div>

              {/* Social Login */}
              <div className="social-buttons">
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Google')}>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                  </svg>
                  Google
                </button>
                <button type="button" className="social-btn" onClick={() => handleSocialLogin('Facebook')}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="#1877F2">
                    <path d="M18 9a9 9 0 1 0-10.406 8.89v-6.29H5.309V9h2.285V7.017c0-2.255 1.343-3.501 3.4-3.501.984 0 2.014.175 2.014.175v2.215h-1.135c-1.118 0-1.467.694-1.467 1.406V9h2.496l-.399 2.6h-2.097v6.29A9.002 9.002 0 0 0 18 9z" />
                  </svg>
                  Facebook
                </button>
              </div>

              {/* Sign Up Link */}
              <p className="auth-footer">
                {t("Don't have an account?")}{' '}
                <Link to="/signup">{t('Create Account')}</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
