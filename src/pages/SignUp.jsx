import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import useOAuth from '../hooks/useOAuth';
import Button from '../components/Button';
import SEO from '../components/SEO';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signup } = useAuth();
  const { t } = useLanguage();
  const { loginWithGoogle, loginWithFacebook, isGoogleEnabled, isFacebookEnabled, loading: oauthLoading } = useOAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password', '');

  const passwordStrength = {
    hasLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const strengthCount = Object.values(passwordStrength).filter(Boolean).length;

  const onSubmit = async (data) => {
    if (!agreedToTerms) {
      toast.error(t('Please agree to the Terms of Service'));
      return;
    }

    setIsLoading(true);

    try {
      // New signup signature: (firstName, lastName, email, password, phone)
      const result = await signup(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.phoneNumber
      );

      if (result.success) {
        // Show message about email verification
        toast.success('Account created! Please check your email to verify your account.');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
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

  return (
    <>
      <SEO
        title="Sign Up - Zanafly | Create Your Account"
        description="Join Zanafly today and start exploring amazing travel destinations. Sign up now to book hotels, flights, and cruise packages."
        keywords="sign up, register, create account, travel booking, Zanafly registration"
        canonical={`${window.location.origin}/signup`}
      />

      <div className="auth-page">
        {/* Left Panel - Branding */}
        <div className="auth-brand-panel signup-brand">
          <div className="brand-content">
            <Link to="/" className="brand-logo">
              <img src="/src/assets/logo.png" alt="Zanafly" />
            </Link>
            <div className="brand-text">
              <h1>{t('Discover Your Next Adventure')}</h1>
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
                <span>{t('Trusted by Millions')}</span>
              </div>
            </div>
          </div>
          <div className="brand-image">
            <img
              src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&h=800&fit=crop&q=80"
              alt="Adventure"
            />
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="auth-form-panel">
          <div className="form-container signup-container">
            <div className="mobile-logo">
              <Link to="/">
                <img src="/src/assets/logo.png" alt="Zanafly" />
              </Link>
            </div>

            <div className="form-header">
              <h2>{t('Create account')}</h2>
              <p>{t('Fill in your details to get started')}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {/* Name Fields */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">{t('First name')}</label>
                  <div className={`input-with-icon ${errors.firstName ? 'error' : ''}`}>
                    <User className="field-icon" size={18} />
                    <input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      {...register('firstName', {
                        required: t('First name') + ' is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                      })}
                    />
                  </div>
                  {errors.firstName && <span className="error-text">{errors.firstName.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">{t('Last name')}</label>
                  <div className={`input-with-icon ${errors.lastName ? 'error' : ''}`}>
                    <User className="field-icon" size={18} />
                    <input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      {...register('lastName', {
                        required: t('Last name') + ' is required',
                        minLength: { value: 2, message: 'Min 2 characters' },
                      })}
                    />
                  </div>
                  {errors.lastName && <span className="error-text">{errors.lastName.message}</span>}
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">{t('Email address')}</label>
                <div className={`input-with-icon ${errors.email ? 'error' : ''}`}>
                  <Mail className="field-icon" size={18} />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
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

              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="phone">{t('Phone number')}</label>
                <div className={`input-with-icon ${errors.phoneNumber ? 'error' : ''}`}>
                  <Phone className="field-icon" size={18} />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...register('phoneNumber', {
                      required: t('Phone number') + ' is required',
                      pattern: {
                        value: /^[0-9+\s\-()]+$/,
                        message: 'Invalid phone number',
                      },
                    })}
                  />
                </div>
                {errors.phoneNumber && <span className="error-text">{errors.phoneNumber.message}</span>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">{t('Password')}</label>
                <div className={`input-with-icon ${errors.password ? 'error' : ''}`}>
                  <Lock className="field-icon" size={18} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('Password')}
                    {...register('password', {
                      required: t('Password') + ' is required',
                      minLength: { value: 8, message: 'Min 8 characters' },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Need uppercase, lowercase & number',
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

                {/* Password Strength Indicator */}
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div
                        className={`strength-fill strength-${strengthCount}`}
                        style={{ width: `${(strengthCount / 4) * 100}%` }}
                      />
                    </div>
                    <div className="strength-checklist">
                      <span className={passwordStrength.hasLength ? 'met' : ''}>
                        <Check size={12} /> 8+
                      </span>
                      <span className={passwordStrength.hasUpper ? 'met' : ''}>
                        <Check size={12} /> A-Z
                      </span>
                      <span className={passwordStrength.hasLower ? 'met' : ''}>
                        <Check size={12} /> a-z
                      </span>
                      <span className={passwordStrength.hasNumber ? 'met' : ''}>
                        <Check size={12} /> 0-9
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <label className="checkbox-label terms-checkbox">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span>
                  {t('I agree to the')}{' '}
                  <Link to="/terms">{t('Terms of Service')}</Link> {t('and')}{' '}
                  <Link to="/privacy">{t('Privacy Policy')}</Link>
                </span>
              </label>

              {/* Submit */}
              <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
                {t('Create Account')}
                <ArrowRight size={18} />
              </Button>

              {/* Divider */}
              <div className="divider">
                <span>{t('or sign up with')}</span>
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

              {/* Sign In Link */}
              <p className="auth-footer">
                {t('Already have an account?')}{' '}
                <Link to="/login">{t('Sign In')}</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
