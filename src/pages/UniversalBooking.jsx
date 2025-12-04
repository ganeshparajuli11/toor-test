import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, CreditCard, Calendar, Check, ChevronRight, AlertCircle, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../contexts/AuthContext';
import { useApiSettings } from '../contexts/ApiSettingsContext';
import api from '../services/api.service';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './UniversalBooking.css';

// Initialize Stripe outside component to avoid recreation
const stripePromise = loadStripe('pk_test_51Oxyz...'); // Replace with your actual publishable key or get from context

const CheckoutForm = ({ totalPrice, onSuccess }) => {
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
      // 1. Create PaymentIntent on backend
      const { data } = await api.post('/payment/create-payment-intent', {
        amount: totalPrice,
        currency: 'usd'
      });

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
        {processing ? 'Processing...' : `Pay $${totalPrice}`}
        <ChevronRight size={20} />
      </button>
    </form>
  );
};

const UniversalBooking = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { apiSettings } = useApiSettings();

  // Update stripe promise when settings change (if using context for key)
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    if (apiSettings?.stripe?.publishableKey) {
      setStripePromise(loadStripe(apiSettings.stripe.publishableKey));
    }
  }, [apiSettings]);

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    specialRequests: ''
  });

  // Mock booking details
  const getBookingDetails = () => {
    const baseDetails = {
      hotel: {
        title: 'Luxury Beach Resort',
        subtitle: 'Deluxe Ocean View Room',
        price: 299,
        details: [
          { label: 'Check-in', value: 'Jan 15, 2025' },
          { label: 'Check-out', value: 'Jan 18, 2025' },
          { label: 'Guests', value: '2 Adults' },
          { label: 'Nights', value: '3' }
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

  const handlePaymentSuccess = (paymentIntent) => {
    toast.success('Booking confirmed! Redirecting...');
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

  return (
    <>
      <SEO
        title={`Complete Your ${typeLabels[type]} Booking | TOOR`}
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

                  {stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <CheckoutForm totalPrice={totalPrice} onSuccess={handlePaymentSuccess} />
                    </Elements>
                  ) : (
                    <div className="alert info">
                      <AlertCircle size={18} />
                      Loading payment system... (Ensure Stripe Key is configured in Admin)
                    </div>
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
                    <div className="pricing-row">
                      <span>Base Price</span>
                      <span>${bookingDetails.price}</span>
                    </div>
                    <div className="pricing-row">
                      <span>Taxes & Fees</span>
                      <span>${taxesAndFees}</span>
                    </div>
                  </div>

                  <div className="summary-divider"></div>

                  <div className="summary-total">
                    <span>Total</span>
                    <span>${totalPrice}</span>
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
