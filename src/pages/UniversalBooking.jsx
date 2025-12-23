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

// Demo Payment Form (for testing without Stripe)
const DemoPaymentForm = ({ totalPrice, onSuccess, formData }) => {
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  const handleDemoPayment = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!cardNumber || !expiry || !cvc || !cardName) {
      toast.error('Please fill in all card details');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all personal information');
      return;
    }

    setProcessing(true);
    toast.loading('Processing payment...');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.dismiss();

    // Simulate successful payment
    const demoPaymentIntent = {
      id: `demo_pi_${Date.now()}`,
      status: 'succeeded',
      amount: totalPrice * 100,
      currency: 'usd',
      created: Date.now(),
      isDemo: true
    };

    setProcessing(false);
    onSuccess(demoPaymentIntent);
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry date
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <form onSubmit={handleDemoPayment} id="demo-payment-form">
      <div className="demo-mode-banner" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <AlertCircle size={20} />
        <div>
          <strong>Demo Mode</strong>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            Use any test card details. Try: 4242 4242 4242 4242
          </p>
        </div>
      </div>

      <div className="form-group form-group-full">
        <label className="form-label">Cardholder Name</label>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          className="form-input"
          placeholder="John Doe"
          required
        />
      </div>

      <div className="form-group form-group-full">
        <label className="form-label">Card Number</label>
        <div className="input-with-icon">
          <CreditCard size={20} />
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            className="form-input"
            placeholder="4242 4242 4242 4242"
            maxLength={19}
            required
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="form-group">
          <label className="form-label">Expiry Date</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className="form-input"
            placeholder="MM/YY"
            maxLength={5}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">CVC</label>
          <input
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
            className="form-input"
            placeholder="123"
            maxLength={4}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="submit-btn"
        disabled={processing}
        style={{
          width: '100%',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '8px',
          cursor: processing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '20px',
          opacity: processing ? 0.7 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {processing ? 'Processing...' : `Pay $${totalPrice} (Demo)`}
        <ChevronRight size={20} />
      </button>

      <p style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
        marginTop: '12px'
      }}>
        This is a demo payment. No real charges will be made.
      </p>
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
    const isDemo = paymentIntent.isDemo;
    const bookingId = `BK${Date.now().toString().slice(-8)}`;

    // Create booking object
    const booking = {
      id: bookingId,
      paymentId: paymentIntent.id,
      type: type,
      itemId: id,
      ...bookingDetails,
      totalPrice,
      taxesAndFees,
      guest: formData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      isDemo
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

    if (isDemo) {
      toast.success(
        `Demo booking confirmed! Booking ID: ${bookingId}`,
        { duration: 4000 }
      );
    } else {
      toast.success('Payment successful! Booking confirmed.');
    }

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

                  {stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <CheckoutForm totalPrice={totalPrice} onSuccess={handlePaymentSuccess} />
                    </Elements>
                  ) : (
                    <DemoPaymentForm
                      totalPrice={totalPrice}
                      onSuccess={handlePaymentSuccess}
                      formData={formData}
                    />
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
                        <span>${bookingDetails.pricePerNight} × {bookingDetails.nights} nights</span>
                        <span>${bookingDetails.price}</span>
                      </div>
                    )}
                    {(!bookingDetails.pricePerNight || bookingDetails.nights <= 1) && (
                      <div className="pricing-row">
                        <span>Base Price</span>
                        <span>${bookingDetails.price}</span>
                      </div>
                    )}
                    <div className="pricing-row">
                      <span>Taxes & Fees (15%)</span>
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
