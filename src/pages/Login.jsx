import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Facebook } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Input from '../components/Input';
import Button from '../components/Button';
import ImageCarousel from '../components/ImageCarousel';
import SEO from '../components/SEO';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Carousel images
  const carouselImages = [
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=1200&fit=crop',
  ];

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      // Use auth context login
      const result = await login(data.email, data.password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Redirect to home page
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
    toast.info(`${provider} login integration coming soon!`);
    // TODO: Implement social login
    console.log(`${provider} login clicked`);
  };

  const handleForgotPassword = () => {
    toast.info('Password reset feature coming soon!');
    // TODO: Implement forgot password
    console.log('Forgot password clicked');
  };

  return (
    <>
      <SEO
        title="Sign In - TOOR | Welcome Back"
        description="Sign in to your TOOR account to access exclusive travel deals, manage bookings, and explore amazing destinations worldwide."
        keywords="sign in, login, travel account, TOOR login, member access"
        canonical={`${window.location.origin}/login`}
      />
      <Header />
      <main className="login-page">
        <div className="container">
          <div className="login-content">
            {/* Left Side - Image Carousel */}
            <div className="login-image-section">
              <ImageCarousel images={carouselImages} />
            </div>

            {/* Right Side - Login Form */}
            <div className="login-form-section">
              <div className="login-form-wrapper">
                <h1 className="login-title">Sign in</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                  {/* Email */}
                  <Input
                    label="Email address"
                    type="email"
                    placeholder="Email address"
                    error={errors.email?.message}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                  />

                  {/* Password */}
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    error={errors.password?.message}
                    icon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    }
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="login-options">
                    <div className="form-checkbox">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <label htmlFor="rememberMe">Keep me signed in</label>
                    </div>
                    <button
                      type="button"
                      className="forgot-password-link"
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Continue with email
                  </Button>

                  {/* Divider */}
                  <div className="form-divider">
                    <span>Or Sign in with</span>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="social-buttons">
                    <Button
                      type="button"
                      variant="social"
                      fullWidth
                      icon={<Facebook size={20} />}
                      onClick={() => handleSocialLogin('Facebook')}
                    >
                      Facebook
                    </Button>
                    <Button
                      type="button"
                      variant="social"
                      fullWidth
                      icon={
                        <svg width="20" height="20" viewBox="0 0 20 20">
                          <path
                            fill="#4285F4"
                            d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
                          />
                          <path
                            fill="#34A853"
                            d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
                          />
                          <path
                            fill="#EA4335"
                            d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
                          />
                        </svg>
                      }
                      onClick={() => handleSocialLogin('Google')}
                    >
                      Google
                    </Button>
                  </div>

                  {/* Signup Link */}
                  <div className="form-footer">
                    Don't have an account?{' '}
                    <Link to="/signup" className="form-link">
                      Register
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Login;
