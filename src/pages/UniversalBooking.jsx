import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, CreditCard, Calendar, Check, ChevronRight, AlertCircle, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import './UniversalBooking.css';

const UniversalBooking = () => {
  const { type, id } = useParams(); // type: hotel, flight, cruise, car
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    specialRequests: ''
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Mock booking details (in real app, fetch based on type and id)
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

  const handlePaymentChange = (e) => {
    let value = e.target.value;

    // Format card number
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (e.target.name === 'expiryDate') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substr(0, 5);
    }

    setPaymentData({
      ...paymentData,
      [e.target.name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
      toast.error('Please complete payment information');
      return;
    }

    // Simulate booking
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
              <p className="booking-subtitle">You're just one step away from your {typeLabels[type].toLowerCase()}</p>
            </div>

            <div className="booking-layout">
              {/* Main Form */}
              <div className="booking-main">
                <form onSubmit={handleSubmit}>
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

                    <div className="form-grid">
                      <div className="form-group form-group-full">
                        <label className="form-label">Card Number *</label>
                        <div className="input-with-icon">
                          <CreditCard size={20} />
                          <input
                            type="text"
                            name="cardNumber"
                            value={paymentData.cardNumber}
                            onChange={handlePaymentChange}
                            className="form-input"
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group form-group-full">
                        <label className="form-label">Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={paymentData.cardName}
                          onChange={handlePaymentChange}
                          className="form-input"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Expiry Date *</label>
                        <div className="input-with-icon">
                          <Calendar size={20} />
                          <input
                            type="text"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handlePaymentChange}
                            className="form-input"
                            placeholder="MM/YY"
                            maxLength="5"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">CVV *</label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handlePaymentChange}
                          className="form-input"
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms and Submit */}
                  <div className="booking-section">
                    <div className="terms-checkbox">
                      <input type="checkbox" id="terms" required />
                      <label htmlFor="terms">
                        I agree to the <a href="/terms">Terms & Conditions</a> and <a href="/privacy">Privacy Policy</a>
                      </label>
                    </div>

                    <button type="submit" className="submit-btn">
                      Confirm Booking & Pay
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </form>
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
