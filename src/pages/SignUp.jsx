import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Check,
  X,
  Plane,
  Hotel,
  Ship,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import useOAuth from '../hooks/useOAuth';
import SEO from '../components/SEO';
import logo from '../assets/logo.png';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const { t } = useLanguage();
  const { loginWithGoogle, loginWithFacebook, isGoogleEnabled, isFacebookEnabled } = useOAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const watchedPassword = watch('password', '');

  useEffect(() => {
    setPassword(watchedPassword);
  }, [watchedPassword]);

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const passwordChecks = {
    length: password.length >= 8,
    letters: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const onSubmit = async (data) => {
    if (!agreeToTerms) {
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.phone || ''
      );

      if (result.success) {
        setTimeout(() => navigate('/'), 1500);
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
        toast.error('Google sign-in is not configured.');
        return;
      }
      const result = loginWithGoogle();
      if (!result.success) {
        toast.error(result.message || 'Failed to initiate Google sign-in');
      }
    } else if (provider === 'Facebook') {
      if (!isFacebookEnabled) {
        toast.error('Facebook sign-in is not configured.');
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
        title="Create Account - Zanafly | Start Your Journey"
        description="Join Zanafly today and unlock exclusive travel deals, easy booking management, and personalized travel recommendations."
        keywords="sign up, create account, register, travel account, Zanafly registration"
        canonical={`${window.location.origin}/signup`}
      />

      <div className="signup-page">
        {/* Animated Background */}
        <div className="signup-bg">
          <div className="signup-bg-gradient"></div>
          <div className="signup-bg-pattern"></div>
          <div className="floating-icons">
            <Plane className="float-icon icon-1" size={32} />
            <Hotel className="float-icon icon-2" size={28} />
            <Ship className="float-icon icon-3" size={30} />
            <Plane className="float-icon icon-4" size={24} />
            <Hotel className="float-icon icon-5" size={26} />
          </div>
        </div>

        {/* SignUp Card */}
        <div className="signup-card">
          {/* Logo */}
          <Link to="/" className="signup-logo">
            <img src={logo} alt="Zanafly" />
          </Link>

          {/* Header */}
          <div className="signup-header">
            <h1>{t('Create Account')}</h1>
            <p>{t('Start your journey with us today')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
            {/* Name Row */}
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="firstName">{t('First Name')}</label>
                <div className={`field-input ${errors.firstName ? 'error' : ''}`}>
                  <span className="field-icon">
                    <User size={20} />
                  </span>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    {...register('firstName', { required: 'First name is required' })}
                  />
                </div>
                {errors.firstName && <span className="field-error">{errors.firstName.message}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="lastName">{t('Last Name')}</label>
                <div className={`field-input ${errors.lastName ? 'error' : ''}`}>
                  <span className="field-icon">
                    <User size={20} />
                  </span>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>
                {errors.lastName && <span className="field-error">{errors.lastName.message}</span>}
              </div>
            </div>

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
                  placeholder="john@example.com"
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

            {/* Phone Field */}
            <div className="form-field">
              <label htmlFor="phone">{t('Phone')} <span className="optional">(Optional)</span></label>
              <div className={`field-input ${errors.phone ? 'error' : ''}`}>
                <span className="field-icon">
                  <Phone size={20} />
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                />
              </div>
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
                  placeholder="Create a strong password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password.message}</span>}

              {/* Password Strength */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className={`strength-fill strength-${passwordStrength}`}
                      style={{ width: `${passwordStrength * 25}%` }}
                    />
                  </div>
                  <div className="strength-checklist">
                    <span className={passwordChecks.length ? 'met' : ''}>
                      {passwordChecks.length ? <Check size={14} /> : <X size={14} />}
                      8+ chars
                    </span>
                    <span className={passwordChecks.letters ? 'met' : ''}>
                      {passwordChecks.letters ? <Check size={14} /> : <X size={14} />}
                      Aa
                    </span>
                    <span className={passwordChecks.number ? 'met' : ''}>
                      {passwordChecks.number ? <Check size={14} /> : <X size={14} />}
                      123
                    </span>
                    <span className={passwordChecks.special ? 'met' : ''}>
                      {passwordChecks.special ? <Check size={14} /> : <X size={14} />}
                      @#$
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-field">
              <label htmlFor="confirmPassword">{t('Confirm Password')}</label>
              <div className={`field-input ${errors.confirmPassword ? 'error' : ''}`}>
                <span className="field-icon">
                  <Lock size={20} />
                </span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* Terms Checkbox */}
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <span className="checkmark"></span>
              <span>
                {t('I agree to the')}{' '}
                <Link to="/terms">{t('Terms of Service')}</Link>
                {' '}{t('and')}{' '}
                <Link to="/privacy">{t('Privacy Policy')}</Link>
              </span>
            </label>

            {/* Submit Button */}
            <button type="submit" className="signup-btn" disabled={isLoading}>
              {isLoading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Creating Account...
                </span>
              ) : (
                <>
                  {t('Create Account')}
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="signup-divider">
              <span>{t('or sign up with')}</span>
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

            {/* Sign In Link */}
            <p className="signin-link">
              {t('Already have an account?')}{' '}
              <Link to="/login">{t('Sign In')}</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
