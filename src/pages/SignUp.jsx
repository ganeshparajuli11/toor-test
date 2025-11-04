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
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signup } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Carousel images
  const carouselImages = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=1200&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=1200&fit=crop',
  ];

  const onSubmit = async (data) => {
    if (!agreedToTerms) {
      toast.error('Please agree to the Terms and Privacy Policies');
      return;
    }

    setIsLoading(true);

    try {
      // Use auth context signup
      const fullName = `${data.firstName} ${data.lastName}`;
      const result = await signup(fullName, data.email, data.password);

      if (result.success) {
        // Redirect to home page
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login integration coming soon!`);
    // TODO: Implement social login
    console.log(`${provider} login clicked`);
  };

  return (
    <>
      <SEO
        title="Sign Up - TOOR | Create Your Account"
        description="Join TOOR today and start exploring amazing travel destinations. Sign up now to book hotels, flights, and cruise packages."
        keywords="sign up, register, create account, travel booking, TOOR registration"
        canonical={`${window.location.origin}/signup`}
      />
      <Header />
      <main className="signup-page">
        <div className="container">
          <div className="signup-content">
            {/* Left Side - Image Carousel */}
            <div className="signup-image-section">
              <ImageCarousel images={carouselImages} />
            </div>

            {/* Right Side - Signup Form */}
            <div className="signup-form-section">
              <div className="signup-form-wrapper">
                <h1 className="signup-title">Sign up</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="signup-form">
                  {/* First Name and Last Name */}
                  <div className="form-row">
                    <Input
                      label="First Name"
                      placeholder="First Name"
                      error={errors.firstName?.message}
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: {
                          value: 2,
                          message: 'First name must be at least 2 characters',
                        },
                      })}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Last Name"
                      error={errors.lastName?.message}
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: {
                          value: 2,
                          message: 'Last name must be at least 2 characters',
                        },
                      })}
                    />
                  </div>

                  {/* Email and Phone Number */}
                  <div className="form-row">
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
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="Phone Number"
                      error={errors.phoneNumber?.message}
                      {...register('phoneNumber', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9+\s-()]+$/,
                          message: 'Invalid phone number',
                        },
                      })}
                    />
                  </div>

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
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message:
                          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                      },
                    })}
                  />

                  {/* Terms and Conditions */}
                  <div className="form-checkbox">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                    />
                    <label htmlFor="terms">
                      I agree to all the Terms and Privacy Policies
                    </label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Sign Up
                  </Button>

                  {/* Divider */}
                  <div className="form-divider">
                    <span>Or Sign up with</span>
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

                  {/* Login Link */}
                  <div className="form-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="form-link">
                      Login
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

export default SignUp;
