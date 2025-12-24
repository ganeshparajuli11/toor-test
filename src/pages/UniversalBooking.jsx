import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  User, Mail, Phone, CreditCard, Calendar, Check, ChevronRight, AlertCircle, Lock, Settings, UserPlus, LogIn
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api.service';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './UniversalBooking.css';

const CheckoutForm = ({ totalPrice, onSuccess, customerEmail, customerName, bookingId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Create PaymentIntent on backend with booking details
      const { data } = await api.post('/payment/create-payment-intent', {
        amount: totalPrice,
        currency: 'chf',
        bookingId: bookingId || `BK${Date.now().toString().slice(-8)}`,
        customerEmail: customerEmail,
        customerName: customerName,
        description: 'Zanafly Booking Payment'
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment');
      }

      const { clientSecret } = data;

      // 2. Confirm payment on client
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setError(result.error.message);
        toast.error(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          onSuccess(result.paymentIntent);
        }
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError('Payment failed. Please try again.');
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="payment-form">
      <div className="form-group form-group-full">
        <label className="form-label">Card Details</label>
        <div className="stripe-card-element-container">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      </div>
      {error && <div className="payment-error">{error}</div>}

      <button type="submit" className="submit-btn" disabled={!stripe || processing}>
        {processing ? 'Processing...' : `Pay CHF ${totalPrice}`}
        <ChevronRight size={20} />
      </button>
    </form>
  );
};

// Payment Not Configured Component
const PaymentNotConfigured = () => {
  return (
    <div className="payment-not-configured" style={{
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
      color: 'white',
      padding: '24px',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <Settings size={48} style={{ marginBottom: '16px', opacity: 0.9 }} />
      <h3 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>Payment Not Available</h3>
      <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, lineHeight: 1.6 }}>
        Payment processing is currently not configured. Please contact the administrator to enable payments.
      </p>
    </div>
  );
};

const UniversalBooking = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Guest checkout state
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [showAuthChoice, setShowAuthChoice] = useState(false);

  // Check if user needs to choose between login or guest checkout
  useEffect(() => {
    if (!isAuthenticated && !isGuestCheckout) {
      setShowAuthChoice(true);
    } else {
      setShowAuthChoice(false);
    }
  }, [isAuthenticated, isGuestCheckout]);

  // Stripe state
  const [stripePromise, setStripePromise] = useState(null);
  const [stripeLoading, setStripeLoading] = useState(true);
  const [stripeError, setStripeError] = useState(null);

  // Fetch Stripe publishable key from backend on mount
  useEffect(() => {
    if (!isAuthenticated && !isGuestCheckout) return; // Don't fetch if not logged in or not guest checkout

    const fetchStripeKey = async () => {
      try {
        setStripeLoading(true);
        setStripeError(null);

        const response = await api.get('/payment/publishable-key');

        if (response.data.success && response.data.publishableKey) {
          setStripePromise(loadStripe(response.data.publishableKey));
        } else {
          setStripeError('Stripe payment is not configured');
        }
      } catch (error) {
        console.error('Error fetching Stripe key:', error);
        setStripeError('Unable to load payment system');
      } finally {
        setStripeLoading(false);
      }
    };

    fetchStripeKey();
  }, [isAuthenticated, isGuestCheckout]);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    specialRequests: ''
  });

  // Get booking details from URL params or use defaults
  const getBookingDetails = () => {
    // Extract hotel params from URL
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = searchParams.get('adults') || 2;
    const children = searchParams.get('children') || 0;
    const rooms = searchParams.get('rooms') || 1;
    const price = parseFloat(searchParams.get('price')) || 0;
    const hotelName = searchParams.get('name') || 'Hotel';
    const hotelLocation = searchParams.get('location') || '';

    // Calculate number of nights
    const calculateNights = () => {
      if (!checkIn || !checkOut) return 1;
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    };

    const nights = calculateNights();
    const totalPrice = price * nights;

    // Format date for display
    const formatDate = (dateStr) => {
      if (!dateStr) return 'Not selected';
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const baseDetails = {
      hotel: {
        title: decodeURIComponent(hotelName),
        subtitle: hotelLocation ? decodeURIComponent(hotelLocation) : 'Standard Room',
        price: totalPrice || 299,
        pricePerNight: price,
        nights: nights,
        details: [
          { label: 'Check-in', value: formatDate(checkIn) },
          { label: 'Check-out', value: formatDate(checkOut) },
          { label: 'Guests', value: `${adults} Adult${adults > 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}` },
          { label: 'Rooms', value: `${rooms} Room${rooms > 1 ? 's' : ''}` },
          { label: 'Nights', value: `${nights}` }
        ]
      },
      flight: {
        title: 'New York to Dubai',
        subtitle: `Emirates • ${searchParams.get('class') || 'Economy'} Class`,
        price: 850,
        details: [
          { label: 'Departure', value: 'Jan 15, 2025 at 10:30 AM' },
          { label: 'Arrival', value: 'Jan 16, 2025 at 6:45 PM' },
          { label: 'Passengers', value: '1 Adult' },
          { label: 'Baggage', value: '23kg included' }
        ]
      },
      cruise: {
        title: 'Mediterranean Dream Cruise',
        subtitle: `${searchParams.get('cabin') || 'Oceanview'} Cabin`,
        price: 1299,
        details: [
          { label: 'Departure', value: 'Mar 15, 2025' },
          { label: 'Duration', value: '7 Nights' },
          { label: 'Passengers', value: '2 Adults' },
          { label: 'Ship', value: 'Royal Princess' }
        ]
      },
      car: {
        title: 'Toyota Camry 2024',
        subtitle: `${searchParams.get('protection') || 'Basic'} Protection`,
        price: 75,
        details: [
          { label: 'Pickup', value: 'Jan 15, 2025 at 10:00 AM' },
          { label: 'Return', value: 'Jan 18, 2025 at 10:00 AM' },
          { label: 'Days', value: '3' },
          { label: 'Location', value: 'LAX Airport' }
        ]
      }
    };

    return baseDetails[type] || baseDetails.hotel;
  };

  const bookingDetails = getBookingDetails();
  const taxesAndFees = Math.round(bookingDetails.price * 0.15);
  const totalPrice = bookingDetails.price + taxesAndFees;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    const bookingId = `BK${Date.now().toString().slice(-8)}`;

    // Create booking object with complete user and guest details
    const booking = {
      id: bookingId,
      paymentId: paymentIntent.id,
      type: type,
      itemId: id,
      ...bookingDetails,
      totalPrice,
      taxesAndFees,
      // Guest information (who the booking is for)
      guest: formData,
      // Logged-in user information (who made the booking)
      bookedBy: isGuestCheckout ? {
        type: 'guest',
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone
      } : {
        type: 'registered',
        id: user?.id || user?._id,
        name: user?.name,
        email: user?.email,
        phone: user?.phone || formData.phone
      },
      bookingSource: isGuestCheckout ? 'guest' : 'authenticated',
      status: 'confirmed',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString()
    };

    try {
      // Save booking to backend
      await api.post('/bookings', booking);
      console.log('Booking saved to backend:', bookingId);
    } catch (error) {
      console.warn('Failed to save booking to backend, using localStorage:', error.message);
      // Fallback to localStorage if backend fails
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingBookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
    }

    toast.success('Payment successful! Booking confirmed.');

    setTimeout(() => {
      navigate('/bookings');
    }, 2000);
  };

  const typeLabels = {
    hotel: 'Hotel',
    flight: 'Flight',
    cruise: 'Cruise',
    car: 'Car Rental'
  };

  // Handle guest checkout selection
  const handleGuestCheckout = () => {
    setIsGuestCheckout(true);
    setShowAuthChoice(false);
    toast.success('Continuing as guest');
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    const currentUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('redirectAfterLogin', currentUrl);
    navigate('/login');
  };

  // Show auth choice screen if not authenticated and not guest checkout
  if (showAuthChoice) {
    return (
      <>
        <SEO
          title={`Complete Your ${typeLabels[type]} Booking | Zanafly`}
          description="Complete your booking with secure payment"
          keywords="booking, payment, reservation"
          canonical={`/${type}/${id}/book`}
        />

        <div className="booking-page">
          <Header />

          <div className="booking-content">
            <div className="container">
              <div className="booking-header">
                <h1 className="booking-title">Complete Your Booking</h1>
                <p className="booking-subtitle">Choose how you'd like to continue</p>
              </div>

              <div className="auth-choice-container">
                <div className="auth-choice-card">
                  <div className="auth-choice-icon">
                    <LogIn size={48} />
                  </div>
                  <h3>Sign In</h3>
                  <p>Already have an account? Sign in to access your bookings and saved preferences.</p>
                  <button className="auth-choice-btn primary" onClick={handleLoginRedirect}>
                    <LogIn size={20} />
                    Sign In
                  </button>
                  <Link to="/signup" className="auth-choice-link">
                    Don't have an account? <span>Sign Up</span>
                  </Link>
                </div>

                <div className="auth-choice-divider">
                  <span>OR</span>
                </div>

                <div className="auth-choice-card">
                  <div className="auth-choice-icon guest">
                    <UserPlus size={48} />
                  </div>
                  <h3>Continue as Guest</h3>
                  <p>Book without creating an account. Just enter your name and email to proceed.</p>
                  <button className="auth-choice-btn secondary" onClick={handleGuestCheckout}>
                    <UserPlus size={20} />
                    Continue as Guest
                  </button>
                  <span className="auth-choice-note">
                    You'll receive booking confirmation via email
                  </span>
                </div>
              </div>

              {/* Show booking summary */}
              <div className="auth-choice-summary">
                <h4>Booking Summary</h4>
                <div className="summary-preview">
                  <span className="summary-preview-title">{bookingDetails.title}</span>
                  <span className="summary-preview-price">CHF {totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`Complete Your ${typeLabels[type]} Booking | Zanafly`}
        description="Complete your booking with secure payment"
        keywords="booking, payment, reservation"
        canonical={`/${type}/${id}/book`}
      />

      <div className="booking-page">
        <Header />

        <div className="booking-content">
          <div className="container">
            <div className="booking-header">
              <h1 className="booking-title">Complete Your Booking</h1>
              <p className="booking-subtitle">You're just one step away from your {typeLabels[type]?.toLowerCase()}</p>
            </div>

            <div className="booking-layout">
              {/* Main Form */}
              <div className="booking-main">
                {/* Personal Information */}
                <div className="booking-section">
                  <h2 className="section-title">
                    <User size={24} />
                    Personal Information
                  </h2>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <div className="input-with-icon">
                        <Mail size={20} />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number *</label>
                      <div className="input-with-icon">
                        <Phone size={20} />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Special Requests (Optional)</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      className="form-textarea"
                      rows="3"
                      placeholder="Any special requests or requirements?"
                    />
                  </div>
                </div>

                {/* Payment Information */}
                <div className="booking-section">
                  <h2 className="section-title">
                    <CreditCard size={24} />
                    Payment Information
                  </h2>

                  <div className="payment-security-badge">
                    <Lock size={16} />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  {stripeLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <div className="loading-spinner" style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid #f3f3f3',
                        borderTop: '3px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                      }} />
                      <p style={{ color: '#666', margin: 0 }}>Loading payment system...</p>
                    </div>
                  ) : stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <CheckoutForm
                        totalPrice={totalPrice}
                        onSuccess={handlePaymentSuccess}
                        customerEmail={formData.email}
                        customerName={`${formData.firstName} ${formData.lastName}`}
                        bookingId={`BK${Date.now().toString().slice(-8)}`}
                      />
                    </Elements>
                  ) : (
                    <PaymentNotConfigured />
                  )}
                </div>
              </div>

              {/* Sidebar Summary */}
              <aside className="booking-sidebar">
                <div className="summary-card">
                  <h3 className="summary-title">Booking Summary</h3>

                  <div className="summary-item-header">
                    <h4>{bookingDetails.title}</h4>
                    <p>{bookingDetails.subtitle}</p>
                  </div>

                  <div className="summary-divider"></div>

                  {bookingDetails.details.map((detail, index) => (
                    <div key={index} className="summary-detail">
                      <span className="detail-label">{detail.label}</span>
                      <span className="detail-value">{detail.value}</span>
                    </div>
                  ))}

                  <div className="summary-divider"></div>

                  <div className="summary-pricing">
                    {bookingDetails.pricePerNight > 0 && bookingDetails.nights > 1 && (
                      <div className="pricing-row">
                        <span>CHF {bookingDetails.pricePerNight} × {bookingDetails.nights} nights</span>
                        <span>CHF {bookingDetails.price}</span>
                      </div>
                    )}
                    {(!bookingDetails.pricePerNight || bookingDetails.nights <= 1) && (
                      <div className="pricing-row">
                        <span>Base Price</span>
                        <span>CHF {bookingDetails.price}</span>
                      </div>
                    )}
                    <div className="pricing-row">
                      <span>Taxes & Fees (15%)</span>
                      <span>CHF {taxesAndFees}</span>
                    </div>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-total">
                    <span>Total</span>
                    <span>CHF {totalPrice}</span>
                  </div>

                  <div className="summary-features">
                    <div className="feature">
                      <Check size={16} />
                      <span>Free Cancellation</span>
                    </div>
                    <div className="feature">
                      <Check size={16} />
                      <span>Instant Confirmation</span>
                    </div>
                    <div className="feature">
                      <Check size={16} />
                      <span>24/7 Support</span>
                    </div>
                  </div>
                </div>

                <div className="security-badges">
                  <div className="badge-item">
                    <Lock size={20} />
                    <span>Secure Payment</span>
                  </div>
                  <div className="badge-item">
                    <AlertCircle size={20} />
                    <span>Money Back Guarantee</span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default UniversalBooking;
